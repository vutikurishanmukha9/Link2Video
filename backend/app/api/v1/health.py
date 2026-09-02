import asyncio
from typing import Dict
from fastapi import APIRouter
from sqlalchemy import text
from app.core.config import settings
from app.core.database import async_session_maker
from app.core.redis import get_redis

router = APIRouter()


@router.api_route("/health", methods=["GET", "HEAD"], summary="Health check")
async def health_check() -> Dict[str, str]:
    """
    Production health check endpoint for Render monitoring.
    Reports operational status of the service, database, and cache.
    """
    # 1. Check Redis / Cache
    redis = get_redis()
    try:
        redis_ok = await redis.ping()
    except Exception:
        redis_ok = False

    # 2. Check Database connectivity with 2s timeout
    db_status = "ok"
    try:
        async with async_session_maker() as session:
            await asyncio.wait_for(session.execute(text("SELECT 1")), timeout=2.0)
    except Exception:
        db_status = "degraded"

    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "database": db_status,
        "redis": "ok" if redis_ok else "degraded",
    }
