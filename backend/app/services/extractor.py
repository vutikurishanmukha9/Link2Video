import asyncio
import re
import shutil
from datetime import datetime
from typing import Any, Dict, List, Optional
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError, ExtractorError
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
    PrivateContentException,
    RateLimitExceededException,
)
from app.core.logging import logger
from app.platforms.base import ExtractionResult
from app.schemas.media import MediaItemSchema


def _safe_extract(url: str, custom_opts: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Synchronous worker function to run inside an async thread pool with multi-client rotation."""
    opts: Dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "extract_flat": "in_playlist",
        "playlist_items": "1",
        "socket_timeout": 15,
        "ignoreerrors": False,
        "no_color": True,
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        },
    }

    # Enable EJS JavaScript challenge solving if Node or Deno is installed
    if shutil.which("node"):
        opts["remote_components"] = ["ejs:github"]
        opts["js_runtimes"] = {"node": {}}
    elif shutil.which("deno"):
        opts["remote_components"] = ["ejs:github"]
        opts["js_runtimes"] = {"deno": {}}

    # Provide ffmpeg if available
    ffmpeg_bin = shutil.which("ffmpeg")
    if not ffmpeg_bin:
        try:
            import imageio_ffmpeg
            ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
        except Exception:
            ffmpeg_bin = None
    if ffmpeg_bin:
        opts["ffmpeg_location"] = ffmpeg_bin

    if custom_opts:
        opts.update(custom_opts)

    with YoutubeDL(opts) as ydl:
        return ydl.extract_info(url, download=False)


class RealMediaExtractor:
    """Production media extractor utilizing yt-dlp to extract real video & image streams."""

    @staticmethod
    async def extract(
        url: str,
        platform_slug: str,
        platform_name: str,
        custom_opts: Optional[Dict[str, Any]] = None,
    ) -> ExtractionResult:
        loop = asyncio.get_running_loop()

        try:
            # Run extraction in worker thread with a 25-second timeout
            info = await asyncio.wait_for(
                loop.run_in_executor(None, _safe_extract, url, custom_opts),
                timeout=25.0,
            )
        except asyncio.TimeoutError:
            logger.warning(f"Upstream extraction timed out for {url}")
            raise ExtractionFailedException(
                message="The upstream platform took too long to respond. Please try again."
            )
        except (DownloadError, ExtractorError) as e:
            err_msg = str(e).lower()
            logger.info(f"Extractor caught error for {url}: {err_msg}")

            if "sign in to confirm you're not a bot" in err_msg or "confirm you're not a bot" in err_msg:
                raise ExtractionFailedException(
                    message="YouTube bot protection detected. Please configure YouTube cookies or proxy in server settings to bypass."
                )
            if any(k in err_msg for k in ["private account", "this account is private", "login required", "members-only", "age-restricted"]):
                raise PrivateContentException(
                    message="This content is private, restricted, or requires an account to view."
                )
            if any(k in err_msg for k in ["not found", "404", "deleted", "does not exist", "video unavailable", "no video formats found"]):
                raise NoMediaFoundException(
                    message="The requested post or video was not found or has no downloadable media."
                )
            if any(k in err_msg for k in ["rate limit", "429", "too many requests"]):
                raise RateLimitExceededException(
                    message="Upstream platform rate limit reached. Please wait a moment."
                )

            raise ExtractionFailedException(
                message="Unable to extract media from this post. Make sure the URL is public and valid."
            )
        except Exception as e:
            logger.error(f"Unexpected extraction error for {url}: {e}", exc_info=True)
            raise ExtractionFailedException(
                message="An unexpected error occurred while parsing media from this post."
            )

        if not info:
            raise NoMediaFoundException(message="No media streams could be found in this post.")

        # Extract metadata
        author = (
            info.get("uploader")
            or info.get("uploader_id")
            or info.get("channel")
            or info.get("creator")
            or f"@{platform_slug}.user"
        )
        caption = info.get("description") or info.get("title") or ""

        # Posted timestamp
        posted_at = "Recently"
        if info.get("upload_date"):
            try:
                dt = datetime.strptime(info["upload_date"], "%Y%m%d")
                posted_at = dt.strftime("%b %d, %Y")
            except Exception:
                pass
        elif info.get("timestamp"):
            try:
                dt = datetime.fromtimestamp(info["timestamp"])
                posted_at = dt.strftime("%b %d, %Y")
            except Exception:
                pass

        media_items: List[MediaItemSchema] = []

        # Case 1: Playlist / Carousel entries
        entries = info.get("entries")
        if entries:
            for idx, entry in enumerate(entries):
                if not entry:
                    continue
                item = RealMediaExtractor._parse_entry(entry, idx + 1, platform_slug)
                if item:
                    media_items.append(item)

        # Case 2: Single post / video / image
        if not media_items:
            item = RealMediaExtractor._parse_entry(info, 1, platform_slug)
            if item:
                media_items.append(item)

        if not media_items:
            raise NoMediaFoundException(
                message="No downloadable video or image assets were found in this public post."
            )

        return ExtractionResult(
            platform=platform_name,
            author=author,
            posted_at=posted_at,
            caption=caption,
            media=media_items,
        )

    @staticmethod
    def _parse_entry(entry: Dict[str, Any], index: int, platform_slug: str) -> Optional[MediaItemSchema]:
        entry_id = entry.get("id") or f"{platform_slug}-{index}"
        media_url = entry.get("url")
        media_type = "video" if entry.get("vcodec") != "none" and entry.get("vcodec") is not None else "image"

        # Best format selection
        formats = entry.get("formats", [])
        best_video = None
        if formats:
            # Sort video formats by resolution/bitrate
            video_formats = [
                f for f in formats
                if f.get("url") and (f.get("ext") in ["mp4", "webm", "m4v"] or f.get("vcodec") != "none")
            ]
            if video_formats:
                progressive = [
                    f for f in video_formats
                    if f.get("acodec") not in (None, "none") and f.get("vcodec") not in (None, "none")
                ]
                # For YouTube, DownloaderService merges best video and audio via ffmpeg,
                # so prioritize highest quality video stream (up to 1080p/720p).
                candidates = video_formats if platform_slug == "youtube" else (progressive if progressive else video_formats)
                best_video = max(
                    candidates,
                    key=lambda f: (
                        1 if f.get("ext") == "mp4" else 0,
                        f.get("height") or 0,
                        f.get("filesize") or 0,
                    ),
                )
                media_url = best_video.get("url")
                media_type = "video"
            else:
                # Check for image formats
                image_formats = [
                    f for f in formats
                    if f.get("url") and f.get("ext") in ["jpg", "jpeg", "png", "webp"]
                ]
                if image_formats:
                    best_img = max(image_formats, key=lambda f: (f.get("width") or 0, f.get("height") or 0))
                    media_url = best_img.get("url")
                    media_type = "image"

        if not media_url:
            return None

        # Thumbnails
        thumbnail_url = entry.get("thumbnail")
        thumbnails = entry.get("thumbnails", [])
        if thumbnails and not thumbnail_url:
            thumbnail_url = thumbnails[-1].get("url")

        width = entry.get("width") or (best_video.get("width") if best_video else 1080) or 1080
        height = entry.get("height") or (best_video.get("height") if best_video else 1920) or 1920
        duration = float(entry.get("duration") or 0.0) if entry.get("duration") else None
        file_size = int(entry.get("filesize") or entry.get("filesize_approx") or (best_video.get("filesize") if best_video else 0) or 0)

        # For HLS streams (e.g., BCCI, IPL, MUX), filesize is not declared in playlist header.
        # Estimate accurately from bitrate and duration.
        if file_size <= 0 and duration and duration > 0:
            tbr = (best_video.get("tbr") if best_video else None) or entry.get("tbr")
            if not tbr and best_video:
                vbr = best_video.get("vbr") or 0
                abr = best_video.get("abr") or 0
                if vbr or abr:
                    tbr = vbr + abr
            if tbr and float(tbr) > 0:
                file_size = int((float(tbr) * 1000 / 8) * float(duration))
            else:
                # Standard H.264 bitrate fallback based on resolution
                h_val = int(height)
                w_val = int(width)
                if h_val >= 1080 or w_val >= 1920:
                    est_kbps = 3500
                elif h_val >= 720 or w_val >= 1280:
                    est_kbps = 2000
                elif h_val >= 480:
                    est_kbps = 1000
                else:
                    est_kbps = 600
                file_size = int((est_kbps * 1000 / 8) * float(duration))

        ext = entry.get("ext") or (best_video.get("ext") if best_video else "mp4") or "mp4"
        # Standardize webm to mp4 for universal browser download
        if ext.lower() == "webm" and media_type == "video":
            ext = "mp4"

        raw_id = entry.get("id") or f"{platform_slug}-{index}"
        clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", str(raw_id).split("?")[0].replace(".m3u8", "").replace(".mp4", "")).strip("_")[:48]
        if not clean_id:
            clean_id = f"{platform_slug}_{index}"

        return MediaItemSchema(
            id=clean_id,
            type=media_type,
            url=media_url,
            thumbnail_url=thumbnail_url or media_url,
            width=int(width),
            height=int(height),
            duration=duration,
            format=str(ext).lower(),
            size=file_size if file_size > 0 else 0,
            title=entry.get("title"),
        )
