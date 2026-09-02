import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class InstagramAdapter(PlatformAdapter):
    name = "Instagram"
    slug = "instagram"
    media_types_description = "Photos · Videos · Reels"
    hosts = ["instagram.com", "instagr.am"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "private" in path or "login" in path:
            raise PrivateContentException(
                "This Instagram post is private and requires account authorization."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No downloadable media found in this Instagram post.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
