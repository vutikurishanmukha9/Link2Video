import asyncio
import shutil
import urllib.parse
from typing import Any, Dict
from app.core.config import settings
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

        # Build YouTube anti-blocking options
        custom_opts: Dict[str, Any] = {}

        # Check for Node.js or Deno JS challenge solver
        if shutil.which("node"):
            custom_opts["remote_components"] = ["ejs:github"]
            custom_opts["js_runtimes"] = {"node": {}}
        elif shutil.which("deno"):
            custom_opts["remote_components"] = ["ejs:github"]
            custom_opts["js_runtimes"] = {"deno": {}}

        # Add cookie file if configured in environment
        cookie_file = settings.get_youtube_cookie_file()
        if cookie_file:
            custom_opts["cookiefile"] = cookie_file
            custom_opts["extractor_args"] = {
                "youtube": {
                    "player_client": ["web", "tv", "android", "ios"],
                }
            }
        else:
            # Datacenter IP bypass: Skip webpage & initial_data to bypass BotGuard bot challenges,
            # and target mobile Android/iOS protobuf endpoints directly.
            custom_opts["extractor_args"] = {
                "youtube": {
                    "player_client": ["android", "ios"],
                    "player_skip": ["webpage", "configs", "initial_data"],
                }
            }

        # Add proxy if configured in environment
        if settings.YOUTUBE_PROXY:
            custom_opts["proxy"] = settings.YOUTUBE_PROXY

        # Add PO Token if configured
        if settings.YOUTUBE_PO_TOKEN:
            if "youtube" not in custom_opts.get("extractor_args", {}):
                custom_opts.setdefault("extractor_args", {})["youtube"] = {}
            custom_opts["extractor_args"]["youtube"]["po_token"] = [settings.YOUTUBE_PO_TOKEN]

        result = await RealMediaExtractor.extract(
            url=url,
            platform_slug=self.slug,
            platform_name=self.name,
            custom_opts=custom_opts,
        )

        # Trigger background prewarm for instantaneous HD download
        try:
            from app.services.downloader import downloader_service
            if result.media and len(result.media) > 0:
                asyncio.create_task(downloader_service.prewarm_youtube_download(result.media[0].id, url))
        except Exception:
            pass

        return result
