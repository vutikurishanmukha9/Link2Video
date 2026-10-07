import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class BandcampAdapter(PlatformAdapter):
    name = "Bandcamp"
    slug = "bandcamp"
    media_types_description = "HQ Audio Tracks · Albums · Artwork"
    hosts = ["bandcamp.com"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "private" in path:
            raise PrivateContentException(
                "This Bandcamp release is private."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No playable tracks found in this Bandcamp link.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
