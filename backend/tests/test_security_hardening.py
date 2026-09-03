import pytest

from app.core.exceptions import InvalidURLException
from app.platforms.universal import UniversalWebAdapter
from app.utils.security import is_ip_private_or_reserved, validate_and_guard_url, validate_safe_outbound_url


def test_ssrf_rejects_non_global_carrier_grade_nat_addresses():
    assert is_ip_private_or_reserved("100.64.0.1") is True
    with pytest.raises(InvalidURLException):
        validate_and_guard_url("http://100.64.0.1/admin")


@pytest.mark.parametrize("url", [
    "https://user:secret@example.com/video",
    "https://user:secret@example.com/video.mp4",
])
def test_embedded_credentials_are_rejected(url):
    with pytest.raises(InvalidURLException):
        validate_and_guard_url(url)
    with pytest.raises(InvalidURLException):
        validate_safe_outbound_url(url)


def test_universal_adapter_is_limited_to_configured_public_video_hosts():
    adapter = UniversalWebAdapter()
    assert adapter.can_handle("https://www.bcci.tv/videos/123")
    assert adapter.can_handle("https://player.vimeo.com/video/123")
    assert not adapter.can_handle("https://attacker.example/video")
