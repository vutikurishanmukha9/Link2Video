import json
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.logging import logger
from app.core.redis import get_redis
from app.models.extraction import ExtractionCacheModel
from app.utils.validators import hash_url


class CacheService:
    """
    High-performance multi-tier cache:
    - Tier 1: In-memory LRU with TTL (< 0.1ms latency, zero network)
    - Tier 2: Neon PostgreSQL persistent cache table (< 30ms, survives restarts)
    - Tier 3: Upstash Redis (transparent fallback if configured)
    """

    def __init__(self) -> None:
        self.ttl = settings.CACHE_TTL_SECONDS
        self._memory_store: Dict[str, tuple[Dict[str, Any], float]] = {}

    async def get_extraction(
        self,
        normalized_url: str,
        db: Optional[AsyncSession] = None,
    ) -> Optional[Dict[str, Any]]:
        """Retrieve cached extraction result from In-Memory, Neon DB, or Redis."""
        h = hash_url(normalized_url)
        now_ts = time.time()

        # 1. Check Tier 1: In-Memory cache
        if h in self._memory_store:
            val, exp = self._memory_store[h]
            if exp > now_ts:
                # Keep actively used entries when enforcing the bounded cache.
                self._memory_store.pop(h)
                self._memory_store[h] = (val, exp)
                return val
            del self._memory_store[h]

        # 2. Check Tier 2: Neon PostgreSQL persistent cache table
        if db is not None:
            try:
                now_dt = datetime.now(timezone.utc)
                stmt = select(ExtractionCacheModel).where(
                    ExtractionCacheModel.url_hash == h,
                    ExtractionCacheModel.expires_at > now_dt,
                )
                result = await db.execute(stmt)
                item = result.scalars().first()
                if item:
                    data = json.loads(item.payload_json)
                    # Warm Tier 1 in-memory cache
                    self._memory_store[h] = (data, now_ts + self.ttl)
                    return data
            except Exception as e:
                logger.debug(f"PostgreSQL cache read skipped: {e}")

        # 3. Check Tier 3: Upstash Redis (if enabled)
        if settings.REDIS_URL:
            try:
                redis = get_redis()
                cached_str = await redis.get(f"media:cache:{h}")
                if cached_str:
                    data = json.loads(cached_str)
                    self._memory_store[h] = (data, now_ts + self.ttl)
                    return data
            except Exception:
                pass

        return None

    async def set_extraction(
        self,
        normalized_url: str,
        data: Dict[str, Any],
        platform: str = "unknown",
        db: Optional[AsyncSession] = None,
    ) -> None:
        """Cache extraction result across In-Memory, Neon DB, and Redis."""
        h = hash_url(normalized_url)
        now_ts = time.time()

        # 1. Save in Tier 1: In-Memory cache
        self._memory_store[h] = (data, now_ts + self.ttl)
        # A public endpoint can receive an unbounded number of distinct URLs;
        # cap the process-local cache so it cannot grow without limit.
        while len(self._memory_store) > settings.CACHE_MAX_ITEMS:
            self._memory_store.pop(next(iter(self._memory_store)))

        # 2. Save in Tier 2: Neon PostgreSQL persistent cache table
        if db is not None:
            try:
                now_dt = datetime.now(timezone.utc)
                expires_at = now_dt + timedelta(seconds=self.ttl)
                payload_str = json.dumps(data)

                entry = ExtractionCacheModel(
                    url_hash=h,
                    normalized_url=normalized_url,
                    platform=platform,
                    payload_json=payload_str,
                    created_at=now_dt,
                    expires_at=expires_at,
                )
                await db.merge(entry)
                await db.commit()
            except Exception as e:
                logger.debug(f"PostgreSQL cache write skipped: {e}")

        # 3. Save in Tier 3: Upstash Redis (if enabled)
        if settings.REDIS_URL:
            try:
                redis = get_redis()
                await redis.setex(f"media:cache:{h}", self.ttl, json.dumps(data))
            except Exception:
                pass


cache_service = CacheService()
