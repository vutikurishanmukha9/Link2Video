import re
import urllib.parse
from typing import Optional
import httpx
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
)
from app.core.logging import logger
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.schemas.media import MediaItemSchema
from app.services.extractor import RealMediaExtractor


class MediaFireAdapter(PlatformAdapter):
    """
    MediaFire Cloud Storage Adapter:
    Bypasses ad-heavy download landing pages and resolves instant direct raw file byte streams.
    """

    name = "MediaFire"
    slug = "mediafire"
    media_types_description = "Instant Raw Byte Stream · Ad-Free CDN"
    hosts = ["mediafire.com"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    async def _resolve_mediafire_page(self, url: str) -> tuple[str, str, Optional[int]]:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=12.0) as client:
            resp = await client.get(url)
            if resp.status_code >= 400:
                raise NoMediaFoundException("MediaFire link returned an error or does not exist.")
            html = resp.text

        # 1. Direct CDN download link
        direct_url = None
        patterns = [
            r'aria-label=["\']Download file["\']\s+href=["\']([^"\']+)["\']',
            r'id=["\']downloadButton["\']\s+href=["\']([^"\']+)["\']',
            r'href=["\']((?:https?:)?//download\d*\.mediafire\.com/[^"\']+)["\']',
            r'window\.open\(\s*["\']((?:https?:)?//download\d*\.mediafire\.com/[^"\']+)["\']',
        ]
        for pat in patterns:
            m = re.search(pat, html)
            if m:
                direct_url = m.group(1)
                if direct_url.startswith("//"):
                    direct_url = f"https:{direct_url}"
                break

        if not direct_url:
            raise ExtractionFailedException("Could not find direct download link on MediaFire page.")

        # 2. Filename
        filename = "mediafire_file.mp4"
        fn_match = re.search(r'<div class=["\']filename["\']>([^<]+)</div>', html)
        if not fn_match:
            fn_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html)
        if fn_match:
            filename = fn_match.group(1).strip()

        # 3. File size parsing (e.g., 25.4 MB)
        file_size = None
        size_match = re.search(r'File size:\s*<span>([^<]+)</span>', html, re.I)
        if size_match:
            size_str = size_match.group(1).strip()
            num_m = re.search(r'([\d.]+)\s*([KMGTP]?B)', size_str, re.I)
            if num_m:
                val = float(num_m.group(1))
                unit = num_m.group(2).upper()
                multipliers = {"B": 1, "KB": 1024, "MB": 1024**2, "GB": 1024**3}
                file_size = int(val * multipliers.get(unit, 1))

        return direct_url, filename, file_size

    async def analyze(self, url: str) -> ExtractionResult:
        # Try direct HTML scraping first (sub-500ms, skips all ad popups)
        try:
            direct_url, filename, file_size = await self._resolve_mediafire_page(url)
            ext = filename.rsplit(".", 1)[-1].upper() if "." in filename else "MP4"
            is_video = ext.lower() in ["mp4", "mkv", "mov", "webm", "avi", "ts", "m4v"]

            clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", filename)[:32]
            media_item = MediaItemSchema(
                id=f"mediafire-{clean_id}",
                type="video" if is_video else "image",
                url=direct_url,
                thumbnail_url=None,
                width=1920 if is_video else 1080,
                height=1080 if is_video else 1080,
                duration=None,
                format=ext,
                size=file_size or 0,
                title=filename,
            )

            return ExtractionResult(
                platform=self.name,
                author="@mediafire",
                posted_at="Recently",
                caption=filename,
                media=[media_item],
            )
        except (NoMediaFoundException, ExtractionFailedException):
            pass
        except Exception as e:
            logger.warning(f"MediaFire fast scrape error: {e}")

        # Fallback to yt-dlp extractor
        try:
            return await RealMediaExtractor.extract(url, self.slug, self.name)
        except Exception:
            raise ExtractionFailedException(
                "Unable to resolve MediaFire file. Please check that the link is valid and public."
            )
