from typing import AsyncGenerator
import httpx
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ExtractionFailedException, NoMediaFoundException
from app.core.logging import logger
from app.models.media import MediaItemModel
from app.schemas.media import DownloadResponse


class DownloaderService:
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
        item = result.scalar_one_or_none()

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
        )

    async def stream_media(
        self,
        media_id: str,
        db: AsyncSession,
    ) -> StreamingResponse:
        """Stream media file directly with Content-Disposition attachment for reliable browser downloads."""
        target = await self.get_download_target(media_id, db)

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
            "Content-Disposition": f'attachment; filename="{target.filename}"',
            "Content-Type": target.content_type,
            "X-Content-Type-Options": "nosniff",
        }
        return StreamingResponse(
            stream_generator(),
            media_type=target.content_type,
            headers=headers,
        )


downloader_service = DownloaderService()
