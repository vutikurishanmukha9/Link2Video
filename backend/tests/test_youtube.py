from unittest.mock import patch
import pytest
from httpx import AsyncClient
from app.core.exceptions import ErrorCode, PrivateContentException, NoMediaFoundException
from app.platforms.base import ExtractionResult
from app.schemas.media import MediaItemSchema
from app.services.platform_detector import platform_detector


def test_youtube_detection():
    # Test standard watch URL
    d1 = platform_detector.detect("https://www.youtube.com/watch?v=aqz-KE-bpKQ")
    assert d1 is not None
    adapter1, info1 = d1
    assert adapter1.slug == "youtube"
    assert info1.name == "YouTube"

    # Test shortlink youtu.be
    d2 = platform_detector.detect("https://youtu.be/aqz-KE-bpKQ")
    assert d2 is not None
    adapter2, info2 = d2
    assert adapter2.slug == "youtube"

    # Test YouTube Shorts
    d3 = platform_detector.detect("https://www.youtube.com/shorts/kJQP7kiw5Fk")
    assert d3 is not None
    adapter3, info3 = d3
    assert adapter3.slug == "youtube"


@pytest.mark.asyncio
async def test_analyze_youtube_video(client: AsyncClient):
    fake_result = ExtractionResult(
        platform="YouTube",
        author="Blender Foundation",
        posted_at="Sep 01, 2026",
        caption="Big Buck Bunny 4K 60fps",
        media=[
            MediaItemSchema(
                id="yt-aqz-KE-bpKQ",
                type="video",
                url="https://rr1---sn-example.googlevideo.com/videoplayback",
                thumbnail_url="https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
                width=1920,
                height=1080,
                duration=635.0,
                format="mp4",
                size=45000000,
                title="Big Buck Bunny 4K 60fps",
            )
        ],
    )

    with patch("app.services.extractor.RealMediaExtractor.extract", return_value=fake_result):
        res = await client.post(
            "/api/v1/analyze",
            json={"url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["platform"]["slug"] == "youtube"
        assert data["author"] == "Blender Foundation"
        assert len(data["media"]) == 1
        assert data["media"][0]["format"] == "mp4"
        assert data["media"][0]["width"] == 1920


@pytest.mark.asyncio
async def test_analyze_youtube_shorts(client: AsyncClient):
    fake_result = ExtractionResult(
        platform="YouTube",
        author="@creator",
        posted_at="Recently",
        caption="Amazing Engineering Short",
        media=[
            MediaItemSchema(
                id="yt-kJQP7kiw5Fk",
                type="video",
                url="https://rr2---sn-example.googlevideo.com/videoplayback",
                thumbnail_url="https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
                width=1080,
                height=1920,
                duration=45.0,
                format="mp4",
                size=12000000,
                title="Amazing Engineering Short",
            )
        ],
    )

    with patch("app.services.extractor.RealMediaExtractor.extract", return_value=fake_result):
        res = await client.post(
            "/api/v1/analyze",
            json={"url": "https://www.youtube.com/shorts/kJQP7kiw5Fk"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["platform"]["slug"] == "youtube"
        assert data["media"][0]["height"] == 1920


@pytest.mark.asyncio
async def test_analyze_youtube_private_error(client: AsyncClient):
    res = await client.post(
        "/api/v1/analyze",
        json={"url": "https://www.youtube.com/watch?v=private_video_id"},
    )
    assert res.status_code == 403
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == ErrorCode.PRIVATE_CONTENT.value


@pytest.mark.asyncio
async def test_analyze_youtube_channel_error(client: AsyncClient):
    res = await client.post(
        "/api/v1/analyze",
        json={"url": "https://www.youtube.com/channel/UC1234567890"},
    )
    assert res.status_code == 404
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == ErrorCode.NO_MEDIA_FOUND.value
