from unittest.mock import patch
import pytest
from httpx import AsyncClient
from app.core.exceptions import ErrorCode, PrivateContentException, NoMediaFoundException
from app.platforms.base import ExtractionResult
from app.schemas.media import MediaItemSchema


@pytest.fixture(autouse=True)
def mock_real_extractor():
    """Mock RealMediaExtractor in tests to avoid external network rate limits."""
    async def fake_extract(url: str, slug: str, name: str):
        path = url.lower()
        if "private" in path:
            raise PrivateContentException("This content is private.")
        if "text" in path or "000" in path:
            raise NoMediaFoundException("No media found.")

        if "carousel" in path or "multi" in path:
            return ExtractionResult(
                platform=name,
                author="@creator",
                posted_at="Aug 28, 2026",
                caption="Test carousel",
                media=[
                    MediaItemSchema(id="1", type="image", url="https://cdn.example.com/1.jpg", width=1080, height=1080),
                    MediaItemSchema(id="2", type="video", url="https://cdn.example.com/2.mp4", width=1080, height=1920),
                    MediaItemSchema(id="3", type="image", url="https://cdn.example.com/3.jpg", width=1080, height=1080),
                ],
            )

        return ExtractionResult(
            platform=name,
            author="@creator",
            posted_at="Aug 28, 2026",
            caption="Test video",
            media=[
                MediaItemSchema(
                    id=f"{slug}-1",
                    type="video",
                    url=f"https://cdn.example.com/{slug}-video.mp4",
                    thumbnail_url=f"https://cdn.example.com/{slug}-thumb.jpg",
                    width=1080,
                    height=1920,
                    duration=30.0,
                    format="mp4",
                    size=12000000,
                )
            ],
        )

    with patch("app.services.extractor.RealMediaExtractor.extract", side_effect=fake_extract) as p:
        yield p


@pytest.mark.asyncio
async def test_analyze_instagram_reel(client: AsyncClient):
    response = await client.post(
        "/api/v1/analyze",
        json={"url": "https://www.instagram.com/reel/C8v9z8_L_2m/"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["platform"]["slug"] == "instagram"
    assert len(data["media"]) >= 1
    first_item = data["media"][0]
    assert first_item["type"] == "video"
    assert first_item["width"] == 1080
    assert first_item["height"] == 1920
    assert first_item["url"].startswith("http")


@pytest.mark.asyncio
async def test_analyze_multi_item_carousel(client: AsyncClient):
    response = await client.post(
        "/api/v1/analyze",
        json={"url": "https://www.instagram.com/p/C9w8q_L_11/?carousel=1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["media"]) == 3
    assert data["media"][0]["type"] == "image"
    assert data["media"][1]["type"] == "video"


@pytest.mark.asyncio
async def test_analyze_x_video(client: AsyncClient):
    response = await client.post(
        "/api/v1/analyze",
        json={"url": "https://x.com/rasmus_hale/status/182903124119"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["platform"]["slug"] == "x"
    assert data["media"][0]["type"] == "video"


@pytest.mark.asyncio
async def test_analyze_caching(client: AsyncClient):
    url = "https://www.instagram.com/reel/C8v9z8_L_2m/"
    # First request: fresh extraction
    res1 = await client.post("/api/v1/analyze", json={"url": url})
    assert res1.status_code == 200
    assert res1.json()["meta"]["cached"] is False

    # Second request: served from cache
    res2 = await client.post("/api/v1/analyze", json={"url": url})
    assert res2.status_code == 200
    assert res2.json()["meta"]["cached"] is True


@pytest.mark.asyncio
async def test_analyze_private_post_error(client: AsyncClient):
    response = await client.post(
        "/api/v1/analyze",
        json={"url": "https://www.instagram.com/p/private_locked_post/"},
    )
    assert response.status_code == 403
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == ErrorCode.PRIVATE_CONTENT.value


@pytest.mark.asyncio
async def test_analyze_no_media_error(client: AsyncClient):
    response = await client.post(
        "/api/v1/analyze",
        json={"url": "https://x.com/user/status/000_text_only"},
    )
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == ErrorCode.NO_MEDIA_FOUND.value


@pytest.mark.asyncio
async def test_analyze_invalid_scheme(client: AsyncClient):
    response = await client.post(
        "/api/v1/analyze",
        json={"url": "ftp://server.example.com/video.mp4"},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == ErrorCode.INVALID_URL.value


@pytest.mark.asyncio
async def test_analyze_universal_web_bcci(client: AsyncClient):
    response = await client.post(
        "/api/v1/analyze",
        json={"url": "https://www.bcci.tv/videos/998877/ind-vs-eng-highlights"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["platform"]["slug"] == "web"
    assert data["platform"]["name"] == "BCCI"
    assert len(data["media"]) > 0
