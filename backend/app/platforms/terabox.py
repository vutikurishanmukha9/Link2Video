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


class TeraBoxAdapter(PlatformAdapter):
    """
    TeraBox Cloud Storage Adapter:
    Bypasses mobile app download locks and 0.5 MB/s speed caps.
    Extracts direct CDN stream URLs so users can play and download videos in 1080p directly in browser.
    """

    name = "TeraBox"
    slug = "terabox"
    media_types_description = "Direct 1080p CDN Video · No App Required"
    hosts = [
        "terabox.com",
        "1024tera.com",
        "teraboxapp.com",
        "mirrobox.com",
        "nephobox.com",
        "4funbox.com",
        "freeterabox.com",
        "terabox.app",
    ]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    def _extract_surl(self, url: str) -> Optional[str]:
        # Formats: /s/1abc..., /s/abc..., ?surl=abc...
        m = re.search(r"[?&]surl=([a-zA-Z0-9_-]+)", url)
        if m:
            return m.group(1).lstrip("1")
        m = re.search(r"/s/1?([a-zA-Z0-9_-]+)", url)
        if m:
            return m.group(1)
        return None

    async def _resolve_via_api(self, surl: str) -> Optional[ExtractionResult]:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://www.terabox.com/",
        }

        endpoints = [
            f"https://www.terabox.app/share/list?app_id=250528&shorturl={surl}&root=1",
            f"https://www.terabox.com/api/share/list?app_id=250528&shorturl={surl}&root=1",
        ]

        async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
            for endpoint in endpoints:
                try:
                    resp = await client.get(endpoint)
                    if resp.status_code != 200:
                        continue
                    data = resp.json()
                    if data.get("errno") != 0 or not data.get("list"):
                        continue

                    items: list[MediaItemSchema] = []
                    file_list = data["list"]
                    title = data.get("title") or file_list[0].get("server_filename") or "TeraBox Media"

                    for idx, f in enumerate(file_list):
                        dlink = f.get("dlink")
                        if not dlink:
                            continue
                        filename = f.get("server_filename", f"terabox_video_{idx + 1}.mp4")
                        is_video = str(f.get("category", "1")) == "1" or filename.lower().endswith(
                            (".mp4", ".mkv", ".mov", ".avi", ".webm")
                        )
                        size = int(f.get("size") or 0)
                        thumbs = f.get("thumbs") or {}
                        thumb_url = thumbs.get("url3") or thumbs.get("url2") or thumbs.get("url1")

                        ext = filename.rsplit(".", 1)[-1].upper() if "." in filename else "MP4"

                        items.append(
                            MediaItemSchema(
                                id=f"terabox-{f.get('fs_id') or idx + 1}",
                                type="video" if is_video else "image",
                                url=dlink,
                                thumbnail_url=thumb_url,
                                width=1920 if is_video else 1080,
                                height=1080 if is_video else 1080,
                                duration=None,
                                format=ext,
                                size=size,
                                title=filename,
                            )
                        )

                    if items:
                        return ExtractionResult(
                            platform=self.name,
                            author=str(data.get("uk") or "@terabox.user"),
                            posted_at="Recently",
                            caption=title,
                            media=items,
                        )
                except Exception as e:
                    logger.debug(f"TeraBox API attempt error: {e}")
                    continue

        return None

    async def analyze(self, url: str) -> ExtractionResult:
        surl = self._extract_surl(url)
        if surl:
            api_result = await self._resolve_via_api(surl)
            if api_result:
                return api_result

        # Fallback to yt-dlp extractor
        try:
            return await RealMediaExtractor.extract(url, self.slug, self.name)
        except Exception:
            raise ExtractionFailedException(
                "Unable to resolve TeraBox download stream. Please ensure the link is public and still active."
            )
