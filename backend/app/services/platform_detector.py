from typing import Optional
from app.platforms.base import PlatformAdapter
from app.platforms.registry import platform_registry
from app.schemas.analyze import PlatformInfo
from app.utils.url import normalize_url


class PlatformDetector:
    def detect(self, raw_url: str) -> Optional[tuple[PlatformAdapter, PlatformInfo]]:
        normalized = normalize_url(raw_url)
        adapter = platform_registry.find_by_url(normalized)
        if not adapter:
            return None

        info = PlatformInfo(
            name=adapter.name,
            slug=adapter.slug,
            media=adapter.media_types_description,
            enabled=True,
        )
        return adapter, info


platform_detector = PlatformDetector()
