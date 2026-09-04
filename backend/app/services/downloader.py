import anyio
import asyncio
import os
import re
import shutil
import tempfile
import time
from typing import Any, AsyncGenerator, Optional
import httpx
from fastapi.responses import Response, StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from yt_dlp import YoutubeDL
from app.core.config import settings
from app.core.exceptions import ExtractionFailedException, NoMediaFoundException
from app.core.logging import logger
from app.models.extraction import ExtractionRequestModel
from app.models.media import MediaItemModel
from app.schemas.media import DownloadResponse
from app.utils.security import validate_safe_outbound_url


def _get_ffmpeg_path() -> Optional[str]:
    """Resolve ffmpeg binary from system PATH or imageio_ffmpeg static bundle."""
    ffmpeg_sys = shutil.which("ffmpeg")
    if ffmpeg_sys:
        return ffmpeg_sys
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def _cleanup_old_temp_files(max_age_seconds: int = 7200) -> None:
    """Housekeeping for temporary video cache files older than 2 hours."""
    try:
        temp_dir = tempfile.gettempdir()
        now = time.time()
        for fname in os.listdir(temp_dir):
            if fname.startswith("dl_") and fname.endswith(".mp4"):
                fpath = os.path.join(temp_dir, fname)
                if os.path.isfile(fpath) and (now - os.path.getmtime(fpath)) > max_age_seconds:
                    try:
                        os.remove(fpath)
                    except Exception:
                        pass
    except Exception:
        pass


class DownloaderService:
    def __init__(self):
        self._active_downloads: dict[str, asyncio.Task[str]] = {}

    def _get_hls_temp_path(self, media_id: str) -> str:
        clean_token = re.sub(r"[^a-zA-Z0-9_-]", "_", media_id)[:24]
        return os.path.join(tempfile.gettempdir(), f"dl_{clean_token}_{clean_token}.mp4")

    def _get_youtube_temp_path(self, media_id: str) -> str:
        clean_token = re.sub(r"[^a-zA-Z0-9_-]", "_", media_id)[:32]
        return os.path.join(tempfile.gettempdir(), f"dl_yt_{clean_token}.mp4")

    async def ensure_hls_assembled(self, media_id: str, stream_url: str) -> str:
        """
        Thread-safe and single-flight HLS downloader.
        Ensures exactly ONE process downloads and muxes a given video.
        Any concurrent callers (pre-warm or download click) join the same active task.
        """
        temp_path = self._get_hls_temp_path(media_id)

        # 1. If already assembled and valid on disk, return immediately
        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 1024:
            return temp_path

        # 2. If already being assembled by pre-warm or another request, join and wait for it
        if media_id in self._active_downloads:
            logger.info(f"Joining existing in-flight HLS download for {media_id}")
            return await self._active_downloads[media_id]

        # 3. Create a single active download task
        loop = asyncio.get_running_loop()

        async def _do_download() -> str:
            try:
                _cleanup_old_temp_files()
                ffmpeg_bin = _get_ffmpeg_path()
                ydl_opts: dict[str, Any] = {
                    "outtmpl": temp_path,
                    "format": "best",
                    "quiet": True,
                    "no_warnings": True,
                    "concurrent_fragment_downloads": 4,
                    "max_filesize": 524_288_000,
                    "socket_timeout": 30,
                    "retries": 2,
                    "fragment_retries": 2,
                }
                if ffmpeg_bin:
                    ydl_opts["ffmpeg_location"] = ffmpeg_bin
                    ydl_opts["postprocessors"] = [{"key": "FFmpegVideoConvertor", "preferedformat": "mp4"}]

                def _sync_worker():
                    with YoutubeDL(ydl_opts) as ydl:
                        ydl.download([stream_url])

                await loop.run_in_executor(None, _sync_worker)

                if not os.path.exists(temp_path) or os.path.getsize(temp_path) < 1024:
                    raise ExtractionFailedException("Unable to assemble video fragments into a playable MP4 file.")

                return temp_path
            finally:
                self._active_downloads.pop(media_id, None)

        task = asyncio.create_task(_do_download())
        self._active_downloads[media_id] = task
        return await task

    async def ensure_youtube_assembled(self, media_id: str, original_url: str) -> str:
        """
        Thread-safe and single-flight YouTube downloader & muxer.
        Downloads the best video and audio streams, solving JS challenges via Node.js
        and muxing into a single high-definition MP4 file.
        """
        temp_path = self._get_youtube_temp_path(media_id)

        # 1. If already assembled and valid on disk, return immediately
        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 1024:
            return temp_path

        # 2. If already being assembled by pre-warm or another request, join and wait for it
        if media_id in self._active_downloads:
            logger.info(f"Joining existing in-flight YouTube download for {media_id}")
            return await self._active_downloads[media_id]

        # 3. Create a single active download task
        loop = asyncio.get_running_loop()

        async def _do_download() -> str:
            try:
                _cleanup_old_temp_files()
                ffmpeg_bin = _get_ffmpeg_path()
                node_bin = shutil.which("node")

                ydl_opts: dict[str, Any] = {
                    "outtmpl": temp_path,
                    "format": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best",
                    "quiet": True,
                    "no_warnings": True,
                    "max_filesize": 524_288_000,
                    "socket_timeout": 30,
                    "retries": 3,
                    "fragment_retries": 3,
                    "extractor_args": {
                        "youtube": {
                            "player_client": ["android", "ios", "mweb", "tv"],
                        }
                    },
                }

                if node_bin:
                    ydl_opts["remote_components"] = ["ejs:github"]
                    ydl_opts["js_runtimes"] = {"node": {}}
                elif shutil.which("deno"):
                    ydl_opts["remote_components"] = ["ejs:github"]
                    ydl_opts["js_runtimes"] = {"deno": {}}

                if ffmpeg_bin:
                    ydl_opts["ffmpeg_location"] = ffmpeg_bin
                    ydl_opts["postprocessors"] = [{
                        "key": "FFmpegVideoConvertor",
                        "preferedformat": "mp4",
                    }]

                cookie_file = settings.get_youtube_cookie_file()
                if cookie_file:
                    ydl_opts["cookiefile"] = cookie_file

                if settings.YOUTUBE_PROXY:
                    ydl_opts["proxy"] = settings.YOUTUBE_PROXY

                if settings.YOUTUBE_PO_TOKEN:
                    ydl_opts["extractor_args"]["youtube"]["po_token"] = [settings.YOUTUBE_PO_TOKEN]

                def _sync_worker():
                    with YoutubeDL(ydl_opts) as ydl:
                        ydl.download([original_url])

                await loop.run_in_executor(None, _sync_worker)

                if not os.path.exists(temp_path) or os.path.getsize(temp_path) < 1024:
                    raise ExtractionFailedException("Unable to assemble YouTube video into a playable MP4 file.")

                return temp_path
            finally:
                self._active_downloads.pop(media_id, None)

        task = asyncio.create_task(_do_download())
        self._active_downloads[media_id] = task
        return await task

    async def get_download_target(
        self,
        media_id: str,
        db: AsyncSession,
    ) -> DownloadResponse:
        """Resolve download target from media id, supporting both main media and cover art."""
        is_cover = media_id.endswith("-cover")
        base_id = media_id[:-6] if is_cover else media_id

        stmt = select(MediaItemModel).where(MediaItemModel.media_id == base_id)
        result = await db.execute(stmt)
        item = result.scalars().first()

        if not item:
            raise NoMediaFoundException(f"Media item with ID '{media_id}' not found.")

        if is_cover:
            target_url = item.thumbnail_url or item.source_url
            return DownloadResponse(
                direct_url=target_url,
                filename=f"{base_id}_cover.jpg",
                content_type="image/jpeg",
            )

        ext = item.format.lower()
        filename = f"{item.media_id}.{ext}"
        content_type = "video/mp4" if item.media_type == "video" else "image/jpeg"

        return DownloadResponse(
            direct_url=item.source_url,
            filename=filename,
            content_type=content_type,
            size=item.file_size if item.file_size and item.file_size > 0 else None,
        )

    async def stream_media(
        self,
        media_id: str,
        db: AsyncSession,
    ) -> Response:
        """Stream media file directly with Content-Disposition attachment for reliable browser downloads."""
        is_cover = media_id.endswith("-cover")
        base_id = media_id[:-6] if is_cover else media_id

        stmt = select(MediaItemModel).where(MediaItemModel.media_id == base_id)
        result = await db.execute(stmt)
        item = result.scalars().first()

        if not item:
            raise NoMediaFoundException(f"Media item with ID '{media_id}' not found.")

        target = await self.get_download_target(media_id, db)

        # 1. SSRF defense: Validate initial destination URL against internal/metadata IPs
        validate_safe_outbound_url(target.direct_url)

        # 2. Header injection defense: Sanitize filename against CRLF and quotes
        safe_filename = re.sub(r"[^a-zA-Z0-9._-]", "_", target.filename).strip(".")
        if not safe_filename:
            safe_filename = f"media_{media_id}.mp4"

        # 3. Special handling for HLS playlists (.m3u8 streams on BCCI, IPL, MUX, etc.)
        # Download and mux fragments into a real, 100% playable standard MP4 file with faststart moov
        if ".m3u8" in target.direct_url:
            safe_mp4_name = safe_filename if safe_filename.endswith(".mp4") else f"{safe_filename}.mp4"
            temp_path = await self.ensure_hls_assembled(media_id, target.direct_url)
            file_size = os.path.getsize(temp_path)

            async def file_stream_generator() -> AsyncGenerator[bytes, None]:
                async with await anyio.open_file(temp_path, "rb") as f:
                    while chunk := await f.read(65536):
                        yield chunk

            hls_headers = {
                "Content-Disposition": f'attachment; filename="{safe_mp4_name}"',
                "Content-Type": "video/mp4",
                "Content-Length": str(file_size),
                "X-Content-Type-Options": "nosniff",
            }

            return StreamingResponse(
                file_stream_generator(),
                media_type="video/mp4",
                headers=hls_headers,
            )

        # 4. Special handling for YouTube streams: assemble crisp HD video with full audio
        is_youtube = (
            "googlevideo.com" in target.direct_url
            or "youtube.com" in target.direct_url
            or "youtu.be" in target.direct_url
        )
        if not is_cover and is_youtube:
            safe_mp4_name = safe_filename if safe_filename.endswith(".mp4") else f"{safe_filename}.mp4"
            source_url = target.direct_url
            try:
                req_stmt = select(ExtractionRequestModel).where(ExtractionRequestModel.request_id == item.request_id)
                req_res = await db.execute(req_stmt)
                ext_req = req_res.scalars().first()
                if ext_req and ext_req.source_url:
                    source_url = ext_req.source_url
            except Exception:
                pass

            temp_path = await self.ensure_youtube_assembled(media_id, source_url)
            file_size = os.path.getsize(temp_path)

            async def yt_stream_generator() -> AsyncGenerator[bytes, None]:
                async with await anyio.open_file(temp_path, "rb") as f:
                    while chunk := await f.read(65536):
                        yield chunk

            yt_headers = {
                "Content-Disposition": f'attachment; filename="{safe_mp4_name}"',
                "Content-Type": "video/mp4",
                "Content-Length": str(file_size),
                "X-Content-Type-Options": "nosniff",
            }

            return StreamingResponse(
                yt_stream_generator(),
                media_type="video/mp4",
                headers=yt_headers,
            )

        # 5. Direct progressive streams (MP4/Images from Instagram, Twitter, etc.)
        async def on_redirect_response(response: httpx.Response) -> None:
            if response.is_redirect and response.has_redirect_location and response.next_request:
                validate_safe_outbound_url(str(response.next_request.url))

        async def stream_generator() -> AsyncGenerator[bytes, None]:
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/128.0.0.0 Safari/537.36"
                ),
                "Accept": "*/*",
                "Accept-Encoding": "identity",
            }
            client = httpx.AsyncClient(
                timeout=60.0,
                follow_redirects=True,
                headers=headers,
                event_hooks={"response": [on_redirect_response]},
            )
            try:
                async with client.stream("GET", target.direct_url) as resp:
                    if resp.status_code >= 400:
                        logger.warning(
                            f"Failed to fetch media stream from origin: HTTP {resp.status_code}"
                        )
                        raise ExtractionFailedException("Unable to fetch media stream from origin CDN.")

                    total_bytes = 0
                    max_allowed = 524_288_000  # 500MB safety ceiling
                    async for chunk in resp.aiter_bytes(chunk_size=65536):
                        total_bytes += len(chunk)
                        if total_bytes > max_allowed:
                            logger.warning(f"Media download exceeded 500MB safety limit for {media_id}")
                            break
                        yield chunk
            except Exception as e:
                logger.error(f"Error streaming media {media_id}: {e}")
                raise
            finally:
                await client.aclose()

        headers = {
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Content-Type": target.content_type,
            "X-Content-Type-Options": "nosniff",
        }

        return StreamingResponse(
            stream_generator(),
            media_type=target.content_type,
            headers=headers,
        )

    async def prewarm_hls_download(self, media_id: str, stream_url: str) -> None:
        """Pre-download and remux HLS stream in background so download is instantaneous when clicked."""
        try:
            await self.ensure_hls_assembled(media_id, stream_url)
            logger.info(f"Pre-warmed HLS stream ready for media_id: {media_id}")
        except Exception as e:
            logger.debug(f"Pre-warming HLS stream deferred: {e}")

    async def prewarm_youtube_download(self, media_id: str, original_url: str) -> None:
        """Pre-download and mux YouTube video in background so download is instantaneous when clicked."""
        try:
            await self.ensure_youtube_assembled(media_id, original_url)
            logger.info(f"Pre-warmed YouTube video ready for media_id: {media_id}")
        except Exception as e:
            logger.debug(f"Pre-warming YouTube video deferred: {e}")


downloader_service = DownloaderService()
