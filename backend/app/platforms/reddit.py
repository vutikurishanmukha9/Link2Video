import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class RedditAdapter(PlatformAdapter):
    name = "Reddit"
    slug = "reddit"
    media_types_description = "Photos · Videos · GIFs"
    hosts = ["reddit.com", "redd.it"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "quarantined" in path or "private" in path:
            raise PrivateContentException(
                "This subreddit is private or quarantined and cannot be accessed."
            )
        if "text_only" in path or "/text" in path:
            raise NoMediaFoundException("This Reddit submission is a text-only discussion post.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
