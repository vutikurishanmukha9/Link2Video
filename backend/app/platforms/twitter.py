import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class TwitterAdapter(PlatformAdapter):
    name = "X"
    slug = "x"
    media_types_description = "Photos · Videos · GIFs"
    hosts = ["x.com", "twitter.com"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "private" in path or "protected" in path:
            raise PrivateContentException(
                "This post is from a protected account and cannot be viewed publicly."
            )
        if "/status/000" in path or "text_only" in path:
            raise NoMediaFoundException("This post contains only text, without media attachments.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
