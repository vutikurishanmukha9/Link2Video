from typing import Optional
from app.platforms.base import PlatformAdapter
from app.platforms.registry import platform_registry
from app.schemas.analyze import PlatformInfo
from app.utils.url import normalize_url


class PlatformDetector:
    def detect(self, raw_url: str) -> Optional[tuple[PlatformAdapter, PlatformInfo]]:
        if not raw_url or not isinstance(raw_url, str):
            return None
        clean_raw = raw_url.strip().lower()
        if "://" in clean_raw and not clean_raw.startswith(("http://", "https://")):
            return None

        normalized = normalize_url(raw_url)
        adapter = platform_registry.find_by_url(normalized)
        if not adapter:
            return None

        name = adapter.name
        if adapter.slug == "web" and hasattr(adapter, "get_brand_name"):
            name = adapter.get_brand_name(normalized)

        info = PlatformInfo(
            name=name,
            slug=adapter.slug,
            media=adapter.media_types_description,
            enabled=True,
        )
        return adapter, info


platform_detector = PlatformDetector()
