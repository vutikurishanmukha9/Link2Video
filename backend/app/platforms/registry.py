from typing import List, Optional
from app.platforms.bandcamp import BandcampAdapter
from app.platforms.base import PlatformAdapter
from app.platforms.dropbox import DropboxAdapter
from app.platforms.facebook import FacebookAdapter
from app.platforms.gdrive import GoogleDriveAdapter
from app.platforms.instagram import InstagramAdapter
from app.platforms.linkedin import LinkedInAdapter
from app.platforms.mediafire import MediaFireAdapter
from app.platforms.mega import MegaAdapter
from app.platforms.pinterest import PinterestAdapter
from app.platforms.reddit import RedditAdapter
from app.platforms.soundcloud import SoundCloudAdapter
from app.platforms.terabox import TeraBoxAdapter
from app.platforms.threads import ThreadsAdapter
from app.platforms.tiktok import TikTokAdapter
from app.platforms.twitch import TwitchAdapter
from app.platforms.twitter import TwitterAdapter
from app.platforms.universal import UniversalWebAdapter
from app.platforms.youtube import YouTubeAdapter


class PlatformRegistry:
    def __init__(self) -> None:
        self._specific_adapters: List[PlatformAdapter] = [
            InstagramAdapter(),
            TikTokAdapter(),
            YouTubeAdapter(),
            TwitterAdapter(),
            FacebookAdapter(),
            PinterestAdapter(),
            ThreadsAdapter(),
            SoundCloudAdapter(),
            BandcampAdapter(),
            TwitchAdapter(),
            LinkedInAdapter(),
            RedditAdapter(),
            TeraBoxAdapter(),
            MegaAdapter(),
            GoogleDriveAdapter(),
            MediaFireAdapter(),
            DropboxAdapter(),
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
