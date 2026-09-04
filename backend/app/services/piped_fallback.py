"""
YouTube fallback extraction when yt-dlp is blocked by bot detection.

Strategy:
1. YouTube oEmbed API - Always works from datacenter IPs, returns title, author, thumbnail
2. YouTube page scrape - Attempts to extract duration from watch page HTML
3. Piped API instances - Tries public Piped instances for full stream data (unreliable)
4. Invidious API instances - Tries public Invidious instances as last resort (unreliable)

When all stream-providing APIs fail, we return metadata from oEmbed combined with a
direct YouTube watch URL. The frontend download handler will redirect to YouTube.
"""

import asyncio
import re
import urllib.parse
from typing import Any, Dict, List, Optional

import httpx

from app.core.logging import logger


# Piped API instances (may or may not be available)
PIPED_API_INSTANCES: List[str] = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.r4fo.com",
    "https://pipedapi.leptons.xyz",
]

# Invidious API instances (may or may not be available)
INVIDIOUS_API_INSTANCES: List[str] = [
    "https://inv.tux.pizza",
    "https://invidious.nerdvpn.de",
    "https://iv.ggtyler.dev",
    "https://invidious.lunar.icu",
]

_INSTANCE_TIMEOUT = 8.0
_MAX_ATTEMPTS = 3


def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r"(?:youtube\.com/watch\?.*v=|youtu\.be/|youtube\.com/shorts/|youtube\.com/embed/|youtube\.com/v/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    try:
        parsed = urllib.parse.urlsplit(url)
        qs = urllib.parse.parse_qs(parsed.query)
        v = qs.get("v", [None])[0]
        if v and len(v) == 11:
            return v
    except Exception:
        pass

    return None


async def fetch_oembed_metadata(video_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch basic metadata via YouTube's official oEmbed endpoint.
    This endpoint is NOT affected by bot detection — it always works from datacenter IPs.
    Returns: title, author_name, author_url, thumbnail_url, or None on failure.
    """
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(oembed_url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("title"):
                    logger.info(f"oEmbed metadata fetched for {video_id}: {data['title'][:50]}")
                    return data
            elif resp.status_code == 401:
                # Video exists but is embeddable-restricted; title still in response sometimes
                logger.debug(f"oEmbed returned 401 for {video_id} (embedding disabled)")
            elif resp.status_code == 404:
                logger.debug(f"oEmbed returned 404 for {video_id} (video not found)")
    except Exception as e:
        logger.debug(f"oEmbed fetch failed for {video_id}: {e}")
    return None


async def scrape_duration_from_page(video_id: str) -> Optional[int]:
    """
    Attempt to extract video duration by scraping the YouTube watch page.
    This may fail on datacenter IPs due to bot detection, but is worth trying.
    Returns duration in seconds, or None.
    """
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        async with httpx.AsyncClient(
            timeout=10.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        ) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                m = re.search(r'"lengthSeconds":"(\d+)"', resp.text)
                if m:
                    return int(m.group(1))
    except Exception as e:
        logger.debug(f"Duration scrape failed for {video_id}: {e}")
    return None


async def _query_piped_instance(
    client: httpx.AsyncClient,
    base_url: str,
    video_id: str,
) -> Optional[Dict[str, Any]]:
    """Query a single Piped API instance for stream data."""
    url = f"{base_url}/streams/{video_id}"
    try:
        resp = await client.get(url, timeout=_INSTANCE_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("title") and (data.get("videoStreams") or data.get("audioStreams")):
                return data
    except Exception:
        pass
    return None


async def _query_invidious_instance(
    client: httpx.AsyncClient,
    base_url: str,
    video_id: str,
) -> Optional[Dict[str, Any]]:
    """Query a single Invidious API instance for stream data."""
    url = f"{base_url}/api/v1/videos/{video_id}"
    try:
        resp = await client.get(url, timeout=_INSTANCE_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("title") and (data.get("formatStreams") or data.get("adaptiveFormats")):
                return data
    except Exception:
        pass
    return None


async def fetch_piped_streams(video_id: str) -> Optional[Dict[str, Any]]:
    """Try Piped API instances for full stream data."""
    async with httpx.AsyncClient(
        follow_redirects=True,
        headers={"Accept": "application/json"},
    ) as client:
        for base_url in PIPED_API_INSTANCES[:_MAX_ATTEMPTS]:
            data = await _query_piped_instance(client, base_url, video_id)
            if data:
                logger.info(f"Piped fallback succeeded via {base_url} for {video_id}")
                return data
            await asyncio.sleep(0.2)
    return None


async def fetch_invidious_streams(video_id: str) -> Optional[Dict[str, Any]]:
    """Try Invidious API instances for full stream data."""
    async with httpx.AsyncClient(
        follow_redirects=True,
        headers={"Accept": "application/json"},
    ) as client:
        for base_url in INVIDIOUS_API_INSTANCES[:_MAX_ATTEMPTS]:
            data = await _query_invidious_instance(client, base_url, video_id)
            if data:
                logger.info(f"Invidious fallback succeeded via {base_url} for {video_id}")
                return data
            await asyncio.sleep(0.2)
    return None


def select_best_piped_stream(piped_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Select the best stream from Piped API response."""
    video_streams: List[Dict[str, Any]] = piped_data.get("videoStreams", [])
    if not video_streams:
        return None

    progressive = [s for s in video_streams if not s.get("videoOnly", True) and s.get("url")]
    candidates = progressive if progressive else [s for s in video_streams if s.get("url")]
    if not candidates:
        return None

    def score(s):
        fmt_score = 1 if "MPEG_4" in (s.get("format") or "").upper() else 0
        height = s.get("height") or 0
        if not height:
            m = re.search(r"(\d+)p", s.get("quality", ""))
            if m:
                height = int(m.group(1))
        if height > 1080:
            height = 1080
        return (fmt_score, height, s.get("bitrate") or 0)

    candidates.sort(key=score, reverse=True)
    return candidates[0]


def select_best_invidious_stream(inv_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Select the best stream from Invidious API response."""
    # formatStreams contains progressive (video+audio) streams
    format_streams = inv_data.get("formatStreams", [])
    if format_streams:
        # Sort by quality label
        def quality_score(s):
            q = s.get("qualityLabel", "")
            m = re.search(r"(\d+)p", q)
            height = int(m.group(1)) if m else 0
            is_mp4 = 1 if "mp4" in (s.get("container") or "").lower() else 0
            return (is_mp4, height)

        format_streams.sort(key=quality_score, reverse=True)
        best = format_streams[0]
        if best.get("url"):
            return {
                "url": best["url"],
                "height": int(re.search(r"(\d+)p", best.get("qualityLabel", "")).group(1)) if re.search(r"(\d+)p", best.get("qualityLabel", "")) else 720,
                "width": 0,
                "format": "mp4" if "mp4" in (best.get("container") or "").lower() else "webm",
                "videoOnly": False,
                "quality": best.get("qualityLabel", ""),
                "bitrate": int(best.get("bitrate", 0)) if best.get("bitrate") else 0,
            }
    return None


def build_fallback_result(
    video_id: str,
    oembed: Optional[Dict[str, Any]] = None,
    stream_data: Optional[Dict[str, Any]] = None,
    duration: Optional[int] = None,
) -> Optional[Dict[str, Any]]:
    """
    Build extraction result from whatever data sources succeeded.
    Returns a dict with standardized keys, or None if not enough info.
    """
    if not oembed and not stream_data:
        return None

    title = ""
    uploader = ""
    thumbnail_url = ""
    upload_date = ""
    description = ""

    if oembed:
        title = oembed.get("title", "")
        uploader = oembed.get("author_name", "")
        thumbnail_url = oembed.get("thumbnail_url", "")

    # Override with richer data from stream APIs if available
    if stream_data:
        title = stream_data.get("title") or stream_data.get("title") or title
        uploader = stream_data.get("uploader") or stream_data.get("author") or uploader
        thumbnail_url = stream_data.get("thumbnailUrl") or stream_data.get("videoThumbnails", [{}])[0].get("url", "") or thumbnail_url
        upload_date = stream_data.get("uploadDate") or stream_data.get("publishedText", "") or ""
        description = stream_data.get("description") or stream_data.get("descriptionHtml", "") or ""
        if not duration:
            duration = stream_data.get("duration") or stream_data.get("lengthSeconds")

    if not title:
        return None

    # Default thumbnail from YouTube CDN
    if not thumbnail_url:
        thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

    # Try to get the best stream URL from APIs, otherwise use YouTube watch URL
    stream_url = None
    width = 1280
    height = 720
    fmt = "mp4"
    video_only = False
    quality = "720p"
    bitrate = 0

    if stream_data:
        # Try Piped format
        if stream_data.get("videoStreams"):
            best = select_best_piped_stream(stream_data)
            if best:
                stream_url = best["url"]
                height = best.get("height") or 720
                width = best.get("width") or int(height * 16 / 9)
                fmt = "mp4" if "MPEG_4" in (best.get("format") or "").upper() else "webm"
                video_only = best.get("videoOnly", False)
                quality = best.get("quality", f"{height}p")
                bitrate = best.get("bitrate", 0)

        # Try Invidious format
        elif stream_data.get("formatStreams"):
            best = select_best_invidious_stream(stream_data)
            if best:
                stream_url = best["url"]
                height = best.get("height") or 720
                width = best.get("width") or int(height * 16 / 9)
                fmt = best.get("format", "mp4")
                video_only = best.get("videoOnly", False)
                quality = best.get("quality", f"{height}p")
                bitrate = best.get("bitrate", 0)

    # Last resort: use YouTube watch URL as the stream source.
    # The frontend will handle this by opening the YouTube page directly.
    if not stream_url:
        stream_url = f"https://www.youtube.com/watch?v={video_id}"

    # Standardize format
    if fmt == "webm":
        fmt = "mp4"

    # Estimate file size
    file_size = 0
    if bitrate and duration:
        file_size = int((bitrate / 8) * duration)
    elif duration:
        h = height
        est_kbps = 3500 if h >= 1080 else 2000 if h >= 720 else 1000 if h >= 480 else 600
        file_size = int((est_kbps * 1000 / 8) * duration)

    return {
        "title": title,
        "description": description,
        "uploader": uploader,
        "upload_date": upload_date,
        "duration": int(duration) if duration else None,
        "thumbnail_url": thumbnail_url,
        "stream_url": stream_url,
        "width": width,
        "height": height,
        "format": fmt,
        "video_only": video_only,
        "quality": quality,
        "bitrate": bitrate,
        "file_size": file_size,
    }


async def youtube_fallback_extract(video_id: str) -> Optional[Dict[str, Any]]:
    """
    Main fallback extraction pipeline. Runs multiple strategies concurrently
    and assembles the best available result.

    Returns a standardized dict with video metadata and stream info, or None.
    """
    # Run oEmbed + duration scrape + Piped + Invidious concurrently
    oembed_task = asyncio.create_task(fetch_oembed_metadata(video_id))
    duration_task = asyncio.create_task(scrape_duration_from_page(video_id))
    piped_task = asyncio.create_task(fetch_piped_streams(video_id))
    invidious_task = asyncio.create_task(fetch_invidious_streams(video_id))

    # Wait for all with a global timeout
    try:
        results = await asyncio.wait_for(
            asyncio.gather(oembed_task, duration_task, piped_task, invidious_task, return_exceptions=True),
            timeout=20.0,
        )
    except asyncio.TimeoutError:
        logger.warning(f"YouTube fallback timed out for {video_id}")
        results = [None, None, None, None]

    oembed = results[0] if not isinstance(results[0], Exception) else None
    duration = results[1] if not isinstance(results[1], Exception) else None
    piped = results[2] if not isinstance(results[2], Exception) else None
    invidious = results[3] if not isinstance(results[3], Exception) else None

    # Use whichever stream API responded
    stream_data = piped or invidious

    result = build_fallback_result(
        video_id=video_id,
        oembed=oembed,
        stream_data=stream_data,
        duration=duration,
    )

    if result:
        source = "oEmbed"
        if piped:
            source = "Piped API"
        elif invidious:
            source = "Invidious API"
        logger.info(f"YouTube fallback result for {video_id}: source={source}, quality={result['quality']}")

    return result
