import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class YouTubeAdapter(PlatformAdapter):
    name = "YouTube"
    slug = "youtube"
    media_types_description = "Shorts · Videos · 1080p · 720p · MP4"
    hosts = ["youtube.com", "youtu.be", "m.youtube.com"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def analyze(self, url: str) -> ExtractionResult:
        path = url.lower()
        if "private" in path or "members_only" in path:
            raise PrivateContentException(
                "This YouTube video is private or restricted to channel members."
            )
        if "/channel/" in path or "/c/" in path or "/user/" in path or "/community" in path:
            raise NoMediaFoundException(
                "This URL points to a YouTube channel or community page, not a downloadable video or Short."
            )

        return await RealMediaExtractor.extract(url, self.slug, self.name)
