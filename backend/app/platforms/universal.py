import asyncio
import re
import urllib.parse
import httpx
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
)
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.services.extractor import RealMediaExtractor
from app.core.config import settings
from app.utils.security import validate_safe_outbound_url


class UniversalWebAdapter(PlatformAdapter):
    """
    Universal Web Video Adapter:
    Extracts videos, match highlights, and streams from any public website
    (BCCI, IPL, Google Drive, Vimeo, Dailymotion, news portals, and web video streams).
    """

    name = "Web Video"
    slug = "web"
    hosts = []
    media_types_description = "HD Video, Audio & Streams"

    def can_handle(self, url: str) -> bool:
        if not url or not url.startswith(("http://", "https://")):
            return False
        host = urllib.parse.urlsplit(url).hostname
        if not host:
            return False
        host = host.lower()
        return any(host == domain or host.endswith(f".{domain}") for domain in settings.universal_allowed_domains)

    def get_brand_name(self, url: str) -> str:
        """Extract a user-friendly brand name from the website URL."""
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            if "bcci.tv" in host:
                return "BCCI"
            if "iplt20.com" in host:
                return "IPL"
            if "drive.google.com" in host:
                return "Google Drive"
            if "google.com" in host:
                return "Google Video"

            parts = host.split(".")
            if len(parts) >= 2:
                brand = parts[-2]
                if brand.lower() in {"bcci", "ipl", "espn", "icc", "cricbuzz", "wwe", "nba", "nfl", "nhl", "fifa", "uefa"}:
                    return brand.upper()
                return brand.capitalize()
            return "Web Video"
        except Exception:
            return "Web Video"

    async def _resolve_embedded_media(self, url: str) -> tuple[str | None, str | None, str | None]:
        """
        Inspects the webpage HTML to locate dynamically embedded video streams
        (such as MUX streams on BCCI/IPL, direct .m3u8, .mp4, and OpenGraph metadata).
        Returns (stream_url, page_title, page_thumbnail).
        """
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        try:
            # Validate every hop. A public page can otherwise redirect the
            # server-side fetch to a private or metadata address.
            current_url = validate_safe_outbound_url(url)
            async with httpx.AsyncClient(headers=headers, follow_redirects=False, timeout=12.0) as client:
                for _ in range(4):
                    async with client.stream("GET", current_url) as resp:
                        if resp.is_redirect:
                            location = resp.headers.get("location")
                            if not location:
                                return None, None, None
                            current_url = validate_safe_outbound_url(str(resp.url.join(location)))
                            continue
                        if resp.status_code >= 400:
                            return None, None, None
                        if "html" not in resp.headers.get("content-type", "").lower():
                            return None, None, None
                        chunks = []
                        total = 0
                        async for chunk in resp.aiter_bytes():
                            total += len(chunk)
                            if total > 1_000_000:
                                return None, None, None
                            chunks.append(chunk)
                        html = b"".join(chunks).decode(resp.encoding or "utf-8", errors="replace")
                        break
                else:
                    return None, None, None

            # 1. Extract Page Title (from og:title or <title>)
            title = None
            title_m = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html, re.I)
            if not title_m:
                title_m = re.search(r'<meta\s+name=["\']twitter:title["\']\s+content=["\']([^"\']+)["\']', html, re.I)
            if not title_m:
                title_m = re.search(r'<title>([^<]+)</title>', html, re.I)
            if title_m:
                title = title_m.group(1).strip()

            # 2. Extract Thumbnail (from og:image or twitter:image)
            thumbnail = None
            thumb_m = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.I)
            if not thumb_m:
                thumb_m = re.search(r'<meta\s+name=["\']twitter:image["\']\s+content=["\']([^"\']+)["\']', html, re.I)
            if thumb_m:
                thumbnail = thumb_m.group(1).strip()

            # 3. Search for video streams:
            # Pattern A: MUX HLS streams (used by BCCI & IPL)
            mux_streams = re.findall(r'(https?://stream\.mux\.com/[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', html)
            if mux_streams:
                clean_mux = mux_streams[0].rstrip("\\")
                return clean_mux, title, thumbnail

            # Pattern B: Any other HLS .m3u8 stream embedded in scripts/markup
            m3u8_streams = re.findall(r'(https?://[^\s"\'<>]+\.m3u8(?:\?[^\s"\'<>]*)?)', html)
            if m3u8_streams:
                clean_stream = m3u8_streams[0].rstrip("\\")
                return clean_stream, title, thumbnail

            # Pattern C: Direct progressive .mp4 files
            mp4_streams = re.findall(r'(https?://[^\s"\'<>]+\.mp4(?:\?[^\s"\'<>]*)?)', html)
            if mp4_streams:
                clean_mp4 = mp4_streams[0].rstrip("\\")
                return clean_mp4, title, thumbnail

            return None, title, thumbnail
        except Exception:
            return None, None, None

    async def analyze(self, url: str) -> ExtractionResult:
        brand = self.get_brand_name(url)
        clean_url = url.strip()

        # For known dynamic streaming sites (like BCCI and IPL) that embed MUX/HLS,
        # resolve the embedded stream directly to avoid generic yt-dlp rejection.
        is_known_dynamic_site = any(k in clean_url.lower() for k in ["bcci.tv", "iplt20.com"])

        if is_known_dynamic_site:
            stream_url, title, thumbnail = await self._resolve_embedded_media(clean_url)
            if stream_url:
                result = await RealMediaExtractor.extract(stream_url, self.slug, brand)
                if title:
                    result.caption = title
                if thumbnail:
                    for m in result.media:
                        if not m.thumbnail_url:
                            m.thumbnail_url = thumbnail

                # Pre-warm download in background so when user clicks Download, file is already assembled!
                if ".m3u8" in stream_url and result.media:
                    from app.services.downloader import downloader_service
                    asyncio.create_task(
                        downloader_service.prewarm_hls_download(result.media[0].id, stream_url)
                    )
                return result

        # Standard extraction path via yt-dlp
        try:
            return await RealMediaExtractor.extract(clean_url, self.slug, brand)
        except Exception:
            # Fallback: inspect webpage HTML for embedded video stream
            stream_url, title, thumbnail = await self._resolve_embedded_media(clean_url)
            if stream_url:
                result = await RealMediaExtractor.extract(stream_url, self.slug, brand)
                if title:
                    result.caption = title
                if thumbnail:
                    for m in result.media:
                        if not m.thumbnail_url:
                            m.thumbnail_url = thumbnail

                if ".m3u8" in stream_url and result.media:
                    from app.services.downloader import downloader_service
                    asyncio.create_task(
                        downloader_service.prewarm_hls_download(result.media[0].id, stream_url)
                    )
                return result
            raise
