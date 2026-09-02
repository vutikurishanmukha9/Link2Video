import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_security_headers_present(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("X-Request-ID") is not None


@pytest.mark.asyncio
async def test_payload_size_limit(client: AsyncClient):
    # Giant payload > 64KB should be rejected with 413
    oversized = {"url": "https://www.instagram.com/reel/12345/", "junk": "A" * 70000}
    response = await client.post("/api/v1/analyze", json=oversized)
    assert response.status_code == 413
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "PAYLOAD_TOO_LARGE"
