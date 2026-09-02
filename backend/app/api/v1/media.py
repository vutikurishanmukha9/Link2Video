from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.media import DownloadResponse
from app.services.downloader import downloader_service

router = APIRouter()


@router.get(
    "/media/{media_id}/download",
    response_model=DownloadResponse,
    summary="Get media download URL or stream media attachment",
)
async def get_download(
    media_id: str,
    redirect: bool = False,
    stream: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    Resolve direct source CDN download URL or stream media asset directly.
    When stream=true, returns a chunked binary stream with Content-Disposition: attachment
    for guaranteed browser file download without CORS or inline playback issues.
    """
    if stream:
        return await downloader_service.stream_media(media_id, db)

    target = await downloader_service.get_download_target(media_id, db)
    if redirect:
        return RedirectResponse(url=target.direct_url, status_code=307)
    return target
