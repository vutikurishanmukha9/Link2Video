import re
import urllib.parse
from typing import Optional
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
)
from app.core.logging import logger
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.schemas.media import MediaItemSchema
from app.services.extractor import RealMediaExtractor


class DropboxAdapter(PlatformAdapter):
    """
    Dropbox Cloud Storage Adapter:
    Bypasses ad-heavy download landing pages and resolves instant direct progressive byte streams (dl=1).
    """

    name = "Dropbox"
    slug = "dropbox"
    media_types_description = "Instant Progressive Byte Stream · Direct dl=1"
    hosts = ["dropbox.com"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    def _make_direct_stream_url(self, url: str) -> str:
        """Convert Dropbox landing page URL to raw direct binary stream via dl=1."""
        parsed = urllib.parse.urlsplit(url)
        query = urllib.parse.parse_qs(parsed.query)
        query["dl"] = ["1"]
        new_query = urllib.parse.urlencode(query, doseq=True)
        return urllib.parse.urlunsplit(
            (parsed.scheme, parsed.netloc, parsed.path, new_query, parsed.fragment)
        )

    def _extract_filename_from_url(self, url: str) -> str:
        parsed = urllib.parse.urlsplit(url)
        path_parts = [p for p in parsed.path.split("/") if p]
        if path_parts:
            last = path_parts[-1]
            if "." in last:
                return urllib.parse.unquote(last)
        return "dropbox_file.mp4"

    async def analyze(self, url: str) -> ExtractionResult:
        direct_url = self._make_direct_stream_url(url)

        # 1. Try yt-dlp first for rich video metadata (e.g. thumbnails, duration, dimensions)
        try:
            return await RealMediaExtractor.extract(url, self.slug, self.name)
        except Exception:
            pass

        # 2. Direct dl=1 progressive stream resolver
        filename = self._extract_filename_from_url(url)
        ext = filename.rsplit(".", 1)[-1].upper() if "." in filename else "MP4"
        is_video = ext.lower() in ["mp4", "mkv", "mov", "webm", "avi", "ts", "m4v"]

        clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", filename)[:32]
        media_item = MediaItemSchema(
            id=f"dropbox-{clean_id}",
            type="video" if is_video else "image",
            url=direct_url,
            thumbnail_url=None,
            width=1920 if is_video else 1080,
            height=1080 if is_video else 1080,
            duration=None,
            format=ext,
            size=0,
            title=filename,
        )

        return ExtractionResult(
            platform=self.name,
            author="@dropbox",
            posted_at="Recently",
            caption=filename,
            media=[media_item],
        )
