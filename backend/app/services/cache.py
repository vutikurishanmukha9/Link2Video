import json
from typing import Any, Dict, Optional
from app.core.config import settings
from app.core.redis import get_redis
from app.utils.validators import hash_url


class CacheService:
    def __init__(self) -> None:
        self.ttl = settings.CACHE_TTL_SECONDS

    async def get_extraction(self, normalized_url: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached extraction result if present."""
        key = f"media:cache:{hash_url(normalized_url)}"
        redis = get_redis()
        cached_str = await redis.get(key)
        if cached_str:
            try:
                return json.loads(cached_str)
            except Exception:
                return None
        return None

    async def set_extraction(self, normalized_url: str, data: Dict[str, Any]) -> None:
        """Cache extraction result with configured TTL."""
        key = f"media:cache:{hash_url(normalized_url)}"
        redis = get_redis()
        try:
            await redis.setex(key, self.ttl, json.dumps(data))
        except Exception:
            pass


cache_service = CacheService()
