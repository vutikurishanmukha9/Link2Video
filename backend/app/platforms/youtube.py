import asyncio
import re
import shutil
import urllib.parse
from datetime import datetime
from typing import Any, Dict, Optional

from app.core.config import settings
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
    PrivateContentException,
)
from app.core.logging import logger
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.schemas.media import MediaItemSchema
from app.services.extractor import RealMediaExtractor
from app.services.piped_fallback import (
    extract_video_id,
    youtube_fallback_extract,
)


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

        # Strategy 1: Try yt-dlp first (works when cookies/proxy are configured,
        # or when Render IP is not blocked)
        try:
            result = await self._extract_via_ytdlp(url)
            # Trigger background prewarm for instantaneous HD download
            self._trigger_prewarm(result, url)
            return result
        except ExtractionFailedException as e:
            err_msg = str(e.message).lower() if hasattr(e, "message") else str(e).lower()
            is_bot_detection = any(
                k in err_msg
                for k in ["bot protection", "not a bot", "bot detection", "cookies"]
            )
            if not is_bot_detection:
                raise  # Re-raise non-bot errors (private, not found, etc.)
            logger.info(f"yt-dlp blocked by bot detection for {url}, trying Piped API fallback...")

        # Strategy 2: Piped API fallback when yt-dlp is bot-blocked
        video_id = extract_video_id(url)
        if not video_id:
            raise ExtractionFailedException(
                message="Could not parse YouTube video ID from this URL."
            )

        result = await self._extract_via_piped(video_id)
        if result:
            return result

        # Both strategies failed
        raise ExtractionFailedException(
            message="YouTube is currently blocking requests from this server. "
            "Please try again later, or configure YOUTUBE_COOKIES in your server environment."
        )

    async def _extract_via_ytdlp(self, url: str) -> ExtractionResult:
        """Standard yt-dlp extraction with anti-blocking configuration."""
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
            # Datacenter IP bypass: Skip webpage & initial_data to bypass BotGuard,
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

        return await RealMediaExtractor.extract(
            url=url,
            platform_slug=self.slug,
            platform_name=self.name,
            custom_opts=custom_opts,
        )

    async def _extract_via_piped(self, video_id: str) -> Optional[ExtractionResult]:
        """Fallback extraction via oEmbed + Piped/Invidious APIs concurrently."""
        try:
            parsed = await youtube_fallback_extract(video_id)
            if not parsed:
                return None

            # Convert parsed date
            posted_at = "Recently"
            if parsed["upload_date"]:
                try:
                    dt = datetime.strptime(parsed["upload_date"], "%Y-%m-%d")
                    posted_at = dt.strftime("%b %d, %Y")
                except Exception:
                    pass

            fmt = parsed["format"]

            media_item = MediaItemSchema(
                id=video_id,
                type="video",
                url=parsed["stream_url"],
                thumbnail_url=parsed["thumbnail_url"] or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                width=parsed["width"] or 1920,
                height=parsed["height"] or 1080,
                duration=float(parsed["duration"]) if parsed["duration"] else None,
                format=fmt,
                size=parsed["file_size"],
                title=parsed["title"],
            )

            result = ExtractionResult(
                platform=self.name,
                author=parsed["uploader"] or "@youtube.user",
                posted_at=posted_at,
                caption=parsed["description"] or parsed["title"] or "",
                media=[media_item],
            )

            logger.info(
                f"YouTube fallback extraction succeeded for {video_id}: "
                f"{parsed['quality']} {parsed['width']}x{parsed['height']}"
            )
            return result

        except Exception as e:
            logger.error(f"YouTube fallback extraction error for {video_id}: {e}", exc_info=True)
            return None

    def _trigger_prewarm(self, result: ExtractionResult, url: str) -> None:
        """Trigger background prewarm for instantaneous HD download."""
        try:
            from app.services.downloader import downloader_service
            if result.media and len(result.media) > 0:
                asyncio.create_task(downloader_service.prewarm_youtube_download(result.media[0].id, url))
        except Exception:
            pass
