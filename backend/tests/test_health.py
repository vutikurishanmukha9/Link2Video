import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"


@pytest.mark.asyncio
async def test_platforms_list(client: AsyncClient):
    response = await client.get("/api/v1/platforms")
    assert response.status_code == 200
    data = response.json()
    platforms = data.get("platforms", [])
    slugs = [p["slug"] for p in platforms]
    assert "instagram" in slugs
    assert "x" in slugs
    assert "facebook" in slugs
    assert "linkedin" in slugs
    assert "reddit" in slugs
