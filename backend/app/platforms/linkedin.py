import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class LinkedInAdapter(PlatformAdapter):
    name = "LinkedIn"
    slug = "linkedin"
    media_types_description = "Photos · Videos"
    hosts = ["linkedin.com", "lnkd.in"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "private" in path or "auth_wall" in path:
            raise PrivateContentException(
                "This LinkedIn post is gated behind an organization login requirement."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("This LinkedIn update contains text only.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
