import pytest
from httpx import AsyncClient
from app.core.exceptions import ErrorCode, UnsupportedPlatformException
from app.services.platform_detector import platform_detector
from app.utils.security import validate_and_guard_url


def test_youtube_permanently_unsupported():
    """Verify that YouTube URLs are never detected by platform detector."""
    assert platform_detector.detect("https://www.youtube.com/watch?v=aqz-KE-bpKQ") is None
    assert platform_detector.detect("https://youtu.be/aqz-KE-bpKQ") is None
    assert platform_detector.detect("https://www.youtube.com/shorts/kJQP7kiw5Fk") is None


def test_youtube_rejected_by_security_guard():
    """Verify that security guard explicitly rejects YouTube domains."""
    for url in [
        "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "https://youtu.be/aqz-KE-bpKQ",
        "https://www.youtube.com/shorts/kJQP7kiw5Fk",
        "https://m.youtube.com/watch?v=12345",
    ]:
        with pytest.raises(UnsupportedPlatformException) as exc_info:
            validate_and_guard_url(url)
        assert "YouTube service is permanently disabled" in str(exc_info.value)


@pytest.mark.asyncio
async def test_analyze_youtube_rejected(client: AsyncClient):
    """Verify that API endpoint returns 400 with UNSUPPORTED_PLATFORM for YouTube links."""
    for url in [
        "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "https://youtu.be/aqz-KE-bpKQ",
        "https://www.youtube.com/shorts/kJQP7kiw5Fk",
    ]:
        res = await client.post("/api/v1/analyze", json={"url": url})
        assert res.status_code == 422
        data = res.json()
        assert data["error"]["code"] == ErrorCode.UNSUPPORTED_PLATFORM.value
        assert "YouTube" in data["error"]["message"]
