from unittest.mock import AsyncMock, patch
import pytest
from httpx import AsyncClient
from app.models.media import MediaItemModel
from tests.conftest import TestSessionLocal


@pytest.fixture
async def sample_media_item():
    """Insert isolated test media item before test."""
    async with TestSessionLocal() as session:
        item = MediaItemModel(
            request_id="req-test-123",
            media_id="test-media-item-1",
            media_type="video",
            source_url="https://cdn.example.com/video1.mp4",
            format="mp4",
            file_size=15000000,
        )
        session.add(item)
        await session.commit()
    return "test-media-item-1"


@pytest.mark.asyncio
async def test_download_target_resolution(client: AsyncClient, sample_media_item):
    # Query download info
    res = await client.get("/api/v1/media/test-media-item-1/download")
    assert res.status_code == 200
    data = res.json()
    assert data["direct_url"] == "https://cdn.example.com/video1.mp4"
    assert data["filename"] == "test-media-item-1.mp4"
    assert data["content_type"] == "video/mp4"


@pytest.mark.asyncio
async def test_download_redirect(client: AsyncClient, sample_media_item):
    # Query with redirect=True
    res = await client.get(
        "/api/v1/media/test-media-item-1/download?redirect=true",
        follow_redirects=False,
    )
    assert res.status_code == 307
    assert res.headers["location"] == "https://cdn.example.com/video1.mp4"


@pytest.mark.asyncio
async def test_download_stream_attachment(client: AsyncClient, sample_media_item):
    # Mock httpx stream in DownloaderService
    mock_chunks = [b"chunk1", b"chunk2"]

    class MockStreamResponse:
        status_code = 200
        async def aiter_bytes(self, chunk_size=65536):
            for c in mock_chunks:
                yield c
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass

    with patch("httpx.AsyncClient.stream", return_value=MockStreamResponse()):
        res = await client.get("/api/v1/media/test-media-item-1/download?stream=true")
        assert res.status_code == 200
        assert "attachment; filename=\"test-media-item-1.mp4\"" in res.headers.get("content-disposition", "")
        assert res.content == b"chunk1chunk2"


@pytest.mark.asyncio
async def test_download_nonexistent_item_404(client: AsyncClient):
    res = await client.get("/api/v1/media/nonexistent-xyz/download")
    assert res.status_code == 404
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == "NO_MEDIA_FOUND"


@pytest.mark.asyncio
async def test_download_cover_resolution(client: AsyncClient, sample_media_item):
    # Query download info for cover art (-cover suffix)
    res = await client.get("/api/v1/media/test-media-item-1-cover/download")
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "test-media-item-1_cover.jpg"
    assert data["content_type"] == "image/jpeg"

