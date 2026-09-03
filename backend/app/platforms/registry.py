from typing import List, Optional
from app.platforms.base import PlatformAdapter
from app.platforms.facebook import FacebookAdapter
from app.platforms.instagram import InstagramAdapter
from app.platforms.linkedin import LinkedInAdapter
from app.platforms.reddit import RedditAdapter
from app.platforms.twitter import TwitterAdapter
from app.platforms.universal import UniversalWebAdapter
from app.platforms.youtube import YouTubeAdapter


class PlatformRegistry:
    def __init__(self) -> None:
        self._specific_adapters: List[PlatformAdapter] = [
            InstagramAdapter(),
            TwitterAdapter(),
            FacebookAdapter(),
            LinkedInAdapter(),
            RedditAdapter(),
            YouTubeAdapter(),
        ]
        self._universal_adapter = UniversalWebAdapter()

    def get_all(self) -> List[PlatformAdapter]:
        return list(self._specific_adapters) + [self._universal_adapter]

    def find_by_url(self, url: str) -> Optional[PlatformAdapter]:
        # 1. Prioritize specialized platform adapters
        for adapter in self._specific_adapters:
            if adapter.can_handle(url):
                return adapter
        # 2. Universal fallback for any other public web URL (BCCI, IPL, Google Drive, etc.)
        if self._universal_adapter.can_handle(url):
            return self._universal_adapter
        return None

    def find_by_slug(self, slug: str) -> Optional[PlatformAdapter]:
        all_adapters = self._specific_adapters + [self._universal_adapter]
        for adapter in all_adapters:
            if adapter.slug.lower() == slug.lower():
                return adapter
        return None


platform_registry = PlatformRegistry()
