import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class SoundCloudAdapter(PlatformAdapter):
    name = "SoundCloud"
    slug = "soundcloud"
    media_types_description = "HQ Audio · Tracks · Sets · Artwork"
    hosts = ["soundcloud.com", "on.soundcloud.com"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "private" in path or "secret" in path:
            raise PrivateContentException(
                "This SoundCloud track is private and requires a secret token."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No playable audio found in this SoundCloud link.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
