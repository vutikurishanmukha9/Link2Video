import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class TwitchAdapter(PlatformAdapter):
    name = "Twitch"
    slug = "twitch"
    media_types_description = "60 FPS Clips · Gaming Streams · Highlights"
    hosts = ["twitch.tv", "clips.twitch.tv"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "subscriber-only" in path or "subonly" in path:
            raise PrivateContentException(
                "This Twitch VOD is subscriber-only."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No downloadable clip or video found in this Twitch URL.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
