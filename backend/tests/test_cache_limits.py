import pytest

from app.services.cache import CacheService


@pytest.mark.asyncio
async def test_memory_cache_is_bounded(monkeypatch):
    cache = CacheService()
    monkeypatch.setattr("app.services.cache.settings.CACHE_MAX_ITEMS", 2)

    await cache.set_extraction("https://example.com/one", {"media": []})
    await cache.set_extraction("https://example.com/two", {"media": []})
    await cache.set_extraction("https://example.com/three", {"media": []})

    assert len(cache._memory_store) == 2
