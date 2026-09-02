import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class FacebookAdapter(PlatformAdapter):
    name = "Facebook"
    slug = "facebook"
    media_types_description = "Photos · Videos"
    hosts = ["facebook.com", "fb.watch"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "private" in path or ("groups" in path and "closed" in path):
            raise PrivateContentException(
                "This Facebook post or video is from a private group or restricted audience."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No public video or photo found on this Facebook post.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
