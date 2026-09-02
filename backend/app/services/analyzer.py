import time
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import (
    AppException,
    ErrorCode,
    ExtractionFailedException,
    InvalidURLException,
    NoMediaFoundException,
    UnsupportedPlatformException,
)
from app.core.logging import logger
from app.models.extraction import ExtractionErrorModel, ExtractionRequestModel
from app.models.media import MediaItemModel
from app.schemas.analyze import (
    AnalyzeMeta,
    AnalyzeResponse,
    PlatformInfo,
)
from app.schemas.media import MediaItemSchema
from app.services.cache import cache_service
from app.services.platform_detector import platform_detector
from app.services.rate_limiter import rate_limiter
from app.utils.security import validate_and_guard_url
from app.utils.url import normalize_url
from app.utils.validators import generate_request_id


class AnalyzerService:
    async def analyze(
        self,
        raw_url: str,
        client_ip: str,
        db: AsyncSession,
    ) -> AnalyzeResponse:
        start_time = time.time()
        request_id = generate_request_id()

        # 1. Validate URL & SSRF Guard
        try:
            guarded_url = validate_and_guard_url(raw_url)
        except AppException as e:
            await self._log_error(db, request_id, "unknown", e.code.value, e.message)
            raise

        # 2. Normalize URL (strip tracking parameters)
        normalized_url = normalize_url(guarded_url)

        # 3. Detect Platform
        detection = platform_detector.detect(normalized_url)
        if not detection:
            err = UnsupportedPlatformException("Could not map URL to a supported platform adapter.")
            await self._log_error(db, request_id, "unknown", err.code.value, err.message)
            raise err

        adapter, platform_info = detection

        # 4. Check Rate Limit
        await rate_limiter.check_rate_limit(client_ip, action="analyze")

        # 5. Check Redis Cache
        cached_result = await cache_service.get_extraction(normalized_url)
        if cached_result:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(
                "Serving extraction from cache",
                extra={
                    "request_id": request_id,
                    "platform": adapter.slug,
                    "operation": "analyze",
                    "duration_ms": duration_ms,
                    "status": "cache_hit",
                },
            )
            media_items = [MediaItemSchema(**m) for m in cached_result.get("media", [])]
            return AnalyzeResponse(
                success=True,
                request_id=request_id,
                platform=platform_info,
                author=cached_result.get("author"),
                posted_at=cached_result.get("posted_at"),
                caption=cached_result.get("caption"),
                media=media_items,
                meta=AnalyzeMeta(
                    count=len(media_items),
                    cached=True,
                    duration_ms=duration_ms,
                ),
            )

        # 6 & 7. Execute Platform Adapter Extraction
        try:
            extraction = await adapter.analyze(normalized_url)
        except AppException as e:
            await self._record_request(
                db, request_id, normalized_url, adapter.slug, status="failed", error=e
            )
            await self._log_error(db, request_id, adapter.slug, e.code.value, e.message)
            raise
        except Exception as e:
            app_err = ExtractionFailedException(f"Upstream extraction error: {str(e)}")
            await self._record_request(
                db, request_id, normalized_url, adapter.slug, status="failed", error=app_err
            )
            await self._log_error(
                db, request_id, adapter.slug, app_err.code.value, app_err.message
            )
            raise app_err

        # 8. Validate extraction result
        if not extraction.media:
            err = NoMediaFoundException("No downloadable media found in post.")
            await self._record_request(
                db, request_id, normalized_url, adapter.slug, status="failed", error=err
            )
            await self._log_error(db, request_id, adapter.slug, err.code.value, err.message)
            raise err

        # 9. Cache Result
        cache_payload = extraction.model_dump()
        await cache_service.set_extraction(normalized_url, cache_payload)

        # 10. Store Request Metadata & Media Items in PostgreSQL (Neon)
        await self._record_request(
            db,
            request_id,
            normalized_url,
            adapter.slug,
            status="completed",
            media_items=extraction.media,
        )

        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(
            "Extraction completed successfully",
            extra={
                "request_id": request_id,
                "platform": adapter.slug,
                "operation": "analyze",
                "duration_ms": duration_ms,
                "status": "completed",
                "media_count": len(extraction.media),
            },
        )

        # 11. Return Response
        return AnalyzeResponse(
            success=True,
            request_id=request_id,
            platform=platform_info,
            author=extraction.author,
            posted_at=extraction.posted_at,
            caption=extraction.caption,
            media=extraction.media,
            meta=AnalyzeMeta(
                count=len(extraction.media),
                cached=False,
                duration_ms=duration_ms,
            ),
        )

    async def _record_request(
        self,
        db: AsyncSession,
        request_id: str,
        source_url: str,
        platform: str,
        status: str,
        error: Optional[AppException] = None,
        media_items: Optional[list[MediaItemSchema]] = None,
    ) -> None:
        """Store extraction request and media items in PostgreSQL."""
        try:
            req_model = ExtractionRequestModel(
                request_id=request_id,
                source_url=source_url,
                platform=platform,
                status=status,
                completed_at=datetime.now(timezone.utc),
                error_code=error.code.value if error else None,
                error_message=error.message if error else None,
            )
            db.add(req_model)

            if media_items:
                for item in media_items:
                    m_model = MediaItemModel(
                        request_id=request_id,
                        media_id=item.id,
                        media_type=item.type,
                        source_url=item.url,
                        thumbnail_url=item.thumbnail_url,
                        width=item.width,
                        height=item.height,
                        duration=item.duration,
                        file_size=item.size,
                        format=item.format,
                        title=item.title,
                    )
                    db.add(m_model)

            await db.flush()
        except Exception as e:
            logger.warning(f"Database logging failed ({e}); request proceeding.")

    async def _log_error(
        self,
        db: AsyncSession,
        request_id: str,
        platform: str,
        error_code: str,
        message: str,
    ) -> None:
        """Record error details for platform failure analytics."""
        try:
            err_model = ExtractionErrorModel(
                request_id=request_id,
                platform=platform,
                error_code=error_code,
                message=message,
            )
            db.add(err_model)
            await db.flush()
        except Exception as e:
            logger.warning(f"Database error logging failed ({e}).")


analyzer_service = AnalyzerService()
