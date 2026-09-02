import time
from typing import Any, Dict, Optional
import redis.asyncio as aioredis
from app.core.config import settings
from app.core.logging import logger


class InMemoryRedisClient:
    """Thread-safe in-memory cache and rate limiter fallback when REDIS_URL is not set."""

    def __init__(self) -> None:
        self._store: Dict[str, tuple[Any, float]] = {}  # key -> (value, expiry_timestamp)
        self._counters: Dict[str, tuple[int, float]] = {}

    async def get(self, key: str) -> Optional[str]:
        now = time.time()
        if key in self._store:
            val, exp = self._store[key]
            if exp == 0 or exp > now:
                return str(val)
            del self._store[key]
        return None

    async def setex(self, key: str, time_seconds: int, value: str) -> bool:
        now = time.time()
        self._store[key] = (value, now + time_seconds)
        return True

    async def incr(self, key: str) -> int:
        now = time.time()
        if key in self._counters:
            count, exp = self._counters[key]
            if exp == 0 or exp > now:
                new_count = count + 1
                self._counters[key] = (new_count, exp)
                return new_count
        self._counters[key] = (1, 0)
        return 1

    async def expire(self, key: str, seconds: int) -> bool:
        now = time.time()
        if key in self._counters:
            count, _ = self._counters[key]
            self._counters[key] = (count, now + seconds)
            return True
        if key in self._store:
            val, _ = self._store[key]
            self._store[key] = (val, now + seconds)
            return True
        return False

    async def delete(self, key: str) -> int:
        deleted = 0
        if key in self._store:
            del self._store[key]
            deleted += 1
        if key in self._counters:
            del self._counters[key]
            deleted += 1
        return deleted

    async def ping(self) -> bool:
        return True

    async def close(self) -> None:
        self._store.clear()
        self._counters.clear()


class RedisManager:
    def __init__(self) -> None:
        self.client: Any = None

    async def connect(self) -> None:
        if settings.REDIS_URL:
            try:
                self.client = aioredis.from_url(
                    settings.REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                )
                await self.client.ping()
                logger.info("Connected to Upstash Redis successfully.")
                return
            except Exception as e:
                logger.warning(
                    f"Failed to connect to Redis URL ({e}). Falling back to in-memory store."
                )

        logger.info("Using in-memory Redis fallback for caching & rate limiting.")
        self.client = InMemoryRedisClient()

    async def disconnect(self) -> None:
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed.")

    def get_client(self) -> Any:
        if not self.client:
            self.client = InMemoryRedisClient()
        return self.client


redis_manager = RedisManager()


def get_redis() -> Any:
    return redis_manager.get_client()
