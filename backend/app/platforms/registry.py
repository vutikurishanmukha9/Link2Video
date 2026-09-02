from typing import List, Optional
from app.platforms.base import PlatformAdapter
from app.platforms.facebook import FacebookAdapter
from app.platforms.instagram import InstagramAdapter
from app.platforms.linkedin import LinkedInAdapter
from app.platforms.reddit import RedditAdapter
from app.platforms.twitter import TwitterAdapter
from app.platforms.youtube import YouTubeAdapter


class PlatformRegistry:
    def __init__(self) -> None:
        self._adapters: List[PlatformAdapter] = [
            InstagramAdapter(),
            TwitterAdapter(),
            FacebookAdapter(),
            LinkedInAdapter(),
            RedditAdapter(),
            YouTubeAdapter(),
        ]

    def get_all(self) -> List[PlatformAdapter]:
        return list(self._adapters)

    def find_by_url(self, url: str) -> Optional[PlatformAdapter]:
        for adapter in self._adapters:
            if adapter.can_handle(url):
                return adapter
        return None

    def find_by_slug(self, slug: str) -> Optional[PlatformAdapter]:
        for adapter in self._adapters:
            if adapter.slug.lower() == slug.lower():
                return adapter
        return None


platform_registry = PlatformRegistry()
