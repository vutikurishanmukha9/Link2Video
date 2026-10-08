import re
import urllib.parse
from typing import Optional, Tuple
import httpx
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
    PrivateContentException,
)
from app.core.logging import logger
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.schemas.media import MediaItemSchema
from app.services.extractor import RealMediaExtractor


class GoogleDriveAdapter(PlatformAdapter):
    """
    Google Drive Cloud Storage Adapter:
    Bypasses 'File exceeds maximum scan size' warning interstitial and permission friction
    with direct 1-tap download token resolution.
    """

    name = "Google Drive"
    slug = "gdrive"
    media_types_description = "1-Tap Direct Download · Scan Warning Bypass"
    hosts = ["drive.google.com"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    def _extract_file_id(self, url: str) -> Optional[str]:
        # Formats: /file/d/{id}/..., /open?id={id}, /uc?id={id}
        m = re.search(r"(?:/file/d/|[?&]id=)([a-zA-Z0-9_-]{20,})", url)
        if m:
            return m.group(1)
        return None

    async def _resolve_direct_download(self, file_id: str) -> Tuple[str, Optional[str], Optional[int]]:
        """
        Follow Google Drive export URL and resolve the interstitial virus scan warning token
        if file exceeds 100MB. Returns (direct_stream_url, filename, file_size).
        """
        uc_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

        async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=12.0) as client:
            resp = await client.get(uc_url)

            # Check if directly redirected to download binary or CDN
            content_type = resp.headers.get("content-type", "").lower()
            content_disp = resp.headers.get("content-disposition", "")

            filename = None
            if "filename=" in content_disp:
                fn_match = re.search(r'filename\*?=(?:UTF-8\'\')?["\']?([^"\';\r\n]+)', content_disp)
                if fn_match:
                    filename = urllib.parse.unquote(fn_match.group(1))

            file_size = None
            if "content-length" in resp.headers:
                try:
                    file_size = int(resp.headers["content-length"])
                except Exception:
                    pass

            # If not HTML, we already have the direct download link
            if "html" not in content_type and (resp.status_code == 200 or resp.is_success):
                return str(resp.url), filename, file_size

            html = resp.text

            # If permission denied or private
            if "Access denied" in html or "You need access" in html or "Sign in" in html and "drive.google.com" in html:
                if "You need permission" in html or "Request access" in html:
                    raise PrivateContentException(
                        "This Google Drive file is private or requires permission to access. Please set share permissions to 'Anyone with the link'."
                    )

            # Extract filename from page title or meta if not in header
            if not filename:
                title_match = re.search(r"<title>([^<]+)</title>", html)
                if title_match:
                    raw_title = title_match.group(1).replace(" - Google Drive", "").strip()
                    if raw_title and not "Google Drive" in raw_title:
                        filename = raw_title

            # Look for bypass token in the "File exceeds maximum scan size" interstitial
            confirm_token = None

            # Pattern A: confirm query param in anchor
            # <a id="uc-download-link" href="/uc?export=download&confirm=xxxx&id=yyyy">
            token_match = re.search(r'confirm=([a-zA-Z0-9_-]+)', html)
            if token_match:
                confirm_token = token_match.group(1)

            # Pattern B: input hidden field
            if not confirm_token:
                hidden_match = re.search(r'<input[^>]+name=["\']confirm["\'][^>]+value=["\']([^"\']+)["\']', html)
                if hidden_match:
                    confirm_token = hidden_match.group(1)

            # Pattern C: download warning cookie in response cookies
            if not confirm_token:
                for cookie_name in resp.cookies.keys():
                    if "download_warning" in cookie_name:
                        confirm_token = resp.cookies.get(cookie_name)
                        break

            if confirm_token:
                direct_url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm={confirm_token}"
                return direct_url, filename, file_size

            # If no warning interstitial found, return uc_url
            return uc_url, filename, file_size

    async def analyze(self, url: str) -> ExtractionResult:
        file_id = self._extract_file_id(url)
        if not file_id:
            raise ExtractionFailedException("Could not extract Google Drive file ID from link.")

        # Try yt-dlp first for rich video metadata (e.g., thumbnail, dimensions, duration)
        try:
            return await RealMediaExtractor.extract(url, self.slug, self.name)
        except Exception:
            pass

        # 1-Tap download token resolver path
        try:
            direct_url, filename, file_size = await self._resolve_direct_download(file_id)
        except (PrivateContentException, NoMediaFoundException):
            raise
        except Exception as e:
            logger.error(f"Google Drive resolution failed for {file_id}: {e}")
            raise ExtractionFailedException(
                "Unable to resolve Google Drive direct stream. Ensure the file link sharing is set to 'Anyone with the link'."
            )

        final_filename = filename or f"gdrive_{file_id}.mp4"
        ext = final_filename.rsplit(".", 1)[-1].upper() if "." in final_filename else "MP4"
        is_video = ext.lower() in ["mp4", "mkv", "mov", "webm", "avi", "ts", "m4v"]

        media_item = MediaItemSchema(
            id=f"gdrive-{file_id}",
            type="video" if is_video else "image",
            url=direct_url,
            thumbnail_url=None,
            width=1920 if is_video else 1080,
            height=1080 if is_video else 1080,
            duration=None,
            format=ext,
            size=file_size or 0,
            title=final_filename,
        )

        return ExtractionResult(
            platform=self.name,
            author="@googledrive",
            posted_at="Recently",
            caption=final_filename,
            media=[media_item],
        )
