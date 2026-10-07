import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class PinterestAdapter(PlatformAdapter):
    name = "Pinterest"
    slug = "pinterest"
    media_types_description = "Video Pins · Original Photos · Story Pins"
    hosts = ["pinterest.com", "pin.it", "pinterest.co.uk", "pinterest.ca"]

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
                "This Pinterest pin is in a secret or private board."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No downloadable media found in this Pinterest pin.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
