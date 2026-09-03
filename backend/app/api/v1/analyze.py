from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.analyzer import analyzer_service

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse, summary="Analyze post URL")
async def analyze_url(
    payload: AnalyzeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> AnalyzeResponse:
    """
    Validate, extract, cache, and record public media from any supported post URL.
    Returns media streams, resolution, formats, and post metadata.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    if settings.TRUST_PROXY_HEADERS:
        client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or client_ip
    return await analyzer_service.analyze(
        raw_url=payload.url,
        client_ip=client_ip,
        db=db,
    )
