from app.core.config import settings
from app.core.exceptions import RateLimitExceededException
from app.core.redis import get_redis
from app.utils.validators import hash_client_ip


class RateLimiter:
    def __init__(self) -> None:
        self.limit = settings.RATE_LIMIT_ANALYZE
        self.window = settings.RATE_LIMIT_WINDOW_SECONDS

    async def check_rate_limit(self, client_ip: str, action: str = "analyze") -> None:
        """Enforce rate limits per anonymized client IP."""
        client_hash = hash_client_ip(client_ip)
        key = f"rate_limit:{action}:{client_hash}"
        limit = (
            settings.RATE_LIMIT_DOWNLOAD
            if action == "download"
            else settings.RATE_LIMIT_ANALYZE
        )

        redis = get_redis()
        current = await redis.incr(key)

        if current == 1:
            await redis.expire(key, self.window)

        if current > limit:
            raise RateLimitExceededException(
                f"Rate limit of {limit} requests per {self.window}s exceeded. Please slow down."
            )


rate_limiter = RateLimiter()
