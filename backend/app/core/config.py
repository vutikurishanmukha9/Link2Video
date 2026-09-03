from typing import List
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Link2Download API"
    APP_ENV: str = "development"
    API_V1_STR: str = "/api/v1"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # Database Configuration (Neon PostgreSQL in prod, SQLite async locally by default)
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    DATABASE_ECHO: bool = False

    # Redis / Upstash Configuration
    REDIS_URL: str = ""

    # CORS Allowed Origins
    FRONTEND_URL: str = "https://link2download.vercel.app,http://localhost:3000,http://localhost:5173"
    CORS_ORIGINS: str = ""
    CORS_ORIGIN_REGEX: str = ""

    # The universal extractor is intentionally opt-in to a curated set of public
    # video hosts. Add comma-separated roots when supporting another host.
    UNIVERSAL_ALLOWED_DOMAINS: str = "bcci.tv,iplt20.com,drive.google.com,vimeo.com,dailymotion.com"
    TRUST_PROXY_HEADERS: bool = False

    # Rate Limiting & Caching Defaults
    RATE_LIMIT_ANALYZE: int = 10
    RATE_LIMIT_DOWNLOAD: int = 30
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    CACHE_TTL_SECONDS: int = 600
    CACHE_MAX_ITEMS: int = 1_000

    # Optional Provider Keys
    INSTAGRAM_API_KEY: str = ""
    TWITTER_API_KEY: str = ""

    @computed_field
    @property
    def cors_origins(self) -> List[str]:
        raw = self.CORS_ORIGINS or self.FRONTEND_URL
        if raw.strip().startswith("[") and raw.strip().endswith("]"):
            import json
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    res = [str(o).strip() for o in parsed if str(o).strip()]
                    return res
            except Exception:
                pass
        origins = [url.strip() for url in raw.split(",") if url.strip()]
        return origins

    @computed_field
    @property
    def universal_allowed_domains(self) -> List[str]:
        return [domain.strip().lower() for domain in self.UNIVERSAL_ALLOWED_DOMAINS.split(",") if domain.strip()]

    @computed_field
    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


settings = Settings()
