import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class ThreadsAdapter(PlatformAdapter):
    name = "Threads"
    slug = "threads"
    media_types_description = "Photos · Carousels · Videos"
    hosts = ["threads.net"]

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
                "This Threads post is from a private profile."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No downloadable media found in this Threads post.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
