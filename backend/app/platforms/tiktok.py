import urllib.parse
from app.core.exceptions import (
    NoMediaFoundException,
    PrivateContentException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor


class TikTokAdapter(PlatformAdapter):
    name = "TikTok"
    slug = "tiktok"
    media_types_description = "HD Video · No Watermark · Sound Track"
    hosts = ["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]

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
                "This TikTok video is private or restricted."
            )
        if "/text" in path or "no_media" in path:
            raise NoMediaFoundException("No downloadable media found in this TikTok post.")

        return await RealMediaExtractor.extract(url, self.slug, self.name)
