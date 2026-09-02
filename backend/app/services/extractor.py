import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError, ExtractorError
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
    PrivateContentException,
    RateLimitExceededException,
)
from app.core.logging import logger
from app.platforms.base import ExtractionResult
from app.schemas.media import MediaItemSchema


def _safe_extract(url: str, custom_opts: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Synchronous worker function to run inside an async thread pool with multi-client rotation."""
    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "extract_flat": "in_playlist",
        "playlist_items": "1",
        "socket_timeout": 10,
        "nocheckcertificate": True,
        "ignoreerrors": False,
        "no_color": True,
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        },
    }

    # High-end smart client rotation for YouTube to bypass datacenter IP bot-challenges and speed up parsing
    if "youtube.com" in url or "youtu.be" in url:
        opts["extractor_args"] = {
            "youtube": {
                "player_client": ["android", "ios", "mweb", "web"],
                "player_skip": ["configs", "webpage", "js"],
            }
        }

    if custom_opts:
        opts.update(custom_opts)

    with YoutubeDL(opts) as ydl:
        return ydl.extract_info(url, download=False)


class RealMediaExtractor:
    """Production media extractor utilizing yt-dlp to extract real video & image streams."""

    @staticmethod
    async def extract(url: str, platform_slug: str, platform_name: str) -> ExtractionResult:
        loop = asyncio.get_running_loop()

        try:
            # Run extraction in worker thread with a 20-second timeout
            info = await asyncio.wait_for(
                loop.run_in_executor(None, _safe_extract, url),
                timeout=20.0,
            )
        except asyncio.TimeoutError:
            logger.warning(f"Upstream extraction timed out for {url}")
            raise ExtractionFailedException(
                message="The upstream platform took too long to respond. Please try again."
            )
        except (DownloadError, ExtractorError) as e:
            err_msg = str(e).lower()
            logger.info(f"Extractor caught error for {url}: {err_msg}")

            if any(k in err_msg for k in ["login", "private", "members-only", "age-restricted", "confirm you're not a bot", "sign in", "empty media response", "restricted"]):
                raise PrivateContentException(
                    message="This content is private, restricted, or requires an account to view."
                )
            if any(k in err_msg for k in ["not found", "404", "deleted", "does not exist", "video unavailable", "unable to download json"]):
                raise NoMediaFoundException(
                    message="The requested post or video was not found or has been removed."
                )
            if any(k in err_msg for k in ["rate limit", "429", "too many requests"]):
                raise RateLimitExceededException(
                    message="Upstream platform rate limit reached. Please wait a moment."
                )

            raise ExtractionFailedException(
                message="Unable to extract media from this post. Make sure the URL is public and valid."
            )
        except Exception as e:
            logger.error(f"Unexpected extraction error for {url}: {e}", exc_info=True)
            raise ExtractionFailedException(
                message="An unexpected error occurred while parsing media from this post."
            )

        if not info:
            raise NoMediaFoundException(message="No media streams could be found in this post.")

        # Extract metadata
        author = (
            info.get("uploader")
            or info.get("uploader_id")
            or info.get("channel")
            or info.get("creator")
            or f"@{platform_slug}.user"
        )
        caption = info.get("description") or info.get("title") or ""
        
        # Posted timestamp
        posted_at = "Recently"
        if info.get("upload_date"):
            try:
                dt = datetime.strptime(info["upload_date"], "%Y%m%d")
                posted_at = dt.strftime("%b %d, %Y")
            except Exception:
                pass
        elif info.get("timestamp"):
            try:
                dt = datetime.fromtimestamp(info["timestamp"])
                posted_at = dt.strftime("%b %d, %Y")
            except Exception:
                pass

        media_items: List[MediaItemSchema] = []

        # Case 1: Playlist / Carousel entries
        entries = info.get("entries")
        if entries:
            for idx, entry in enumerate(entries):
                if not entry:
                    continue
                item = RealMediaExtractor._parse_entry(entry, idx + 1, platform_slug)
                if item:
                    media_items.append(item)

        # Case 2: Single post / video / image
        if not media_items:
            item = RealMediaExtractor._parse_entry(info, 1, platform_slug)
            if item:
                media_items.append(item)

        if not media_items:
            raise NoMediaFoundException(
                message="No downloadable video or image assets were found in this public post."
            )

        return ExtractionResult(
            platform=platform_name,
            author=author,
            posted_at=posted_at,
            caption=caption,
            media=media_items,
        )

    @staticmethod
    def _parse_entry(entry: Dict[str, Any], index: int, platform_slug: str) -> Optional[MediaItemSchema]:
        entry_id = entry.get("id") or f"{platform_slug}-{index}"
        media_url = entry.get("url")
        media_type = "video" if entry.get("vcodec") != "none" and entry.get("vcodec") is not None else "image"

        # Best format selection
        formats = entry.get("formats", [])
        best_video = None
        if formats:
            # Sort video formats by resolution/bitrate
            video_formats = [
                f for f in formats
                if f.get("url") and (f.get("ext") in ["mp4", "webm", "m4v"] or f.get("vcodec") != "none")
            ]
            if video_formats:
                # Prioritize progressive video formats (contain both video and audio)
                progressive = [
                    f for f in video_formats
                    if f.get("acodec") not in (None, "none") and f.get("vcodec") not in (None, "none")
                ]
                candidates = progressive if progressive else video_formats
                best_video = max(
                    candidates,
                    key=lambda f: (
                        1 if f.get("ext") == "mp4" else 0,
                        f.get("height") or 0,
                        f.get("filesize") or 0,
                    ),
                )
                media_url = best_video.get("url")
                media_type = "video"
            else:
                # Check for image formats
                image_formats = [
                    f for f in formats
                    if f.get("url") and f.get("ext") in ["jpg", "jpeg", "png", "webp"]
                ]
                if image_formats:
                    best_img = max(image_formats, key=lambda f: (f.get("width") or 0, f.get("height") or 0))
                    media_url = best_img.get("url")
                    media_type = "image"

        if not media_url:
            return None

        # Thumbnails
        thumbnail_url = entry.get("thumbnail")
        thumbnails = entry.get("thumbnails", [])
        if thumbnails and not thumbnail_url:
            thumbnail_url = thumbnails[-1].get("url")

        width = entry.get("width") or (best_video.get("width") if best_video else 1080) or 1080
        height = entry.get("height") or (best_video.get("height") if best_video else 1920) or 1920
        duration = float(entry.get("duration") or 0.0) if entry.get("duration") else None
        file_size = int(entry.get("filesize") or entry.get("filesize_approx") or (best_video.get("filesize") if best_video else 0) or 0)
        ext = entry.get("ext") or (best_video.get("ext") if best_video else "mp4") or "mp4"

        return MediaItemSchema(
            id=str(entry_id),
            type=media_type,
            url=media_url,
            thumbnail_url=thumbnail_url or media_url,
            width=int(width),
            height=int(height),
            duration=duration,
            format=str(ext).lower(),
            size=file_size if file_size > 0 else 2_000_000,
            title=entry.get("title"),
        )
