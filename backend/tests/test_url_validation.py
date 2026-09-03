import pytest
from app.core.exceptions import InvalidURLException, UnsupportedPlatformException
from app.utils.security import is_ip_private_or_reserved, validate_and_guard_url
from app.utils.url import normalize_url


def test_url_normalization():
    raw = "  https://www.instagram.com/reel/C8v9z8_L_2m/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==  "
    normalized = normalize_url(raw)
    assert "utm_source" not in normalized
    assert "igsh" not in normalized
    assert normalized == "https://www.instagram.com/reel/C8v9z8_L_2m/"


def test_ssrf_rejects_localhost():
    with pytest.raises(InvalidURLException):
        validate_and_guard_url("http://localhost:8000/admin")

    with pytest.raises(InvalidURLException):
        validate_and_guard_url("http://127.0.0.1:8000")


def test_ssrf_rejects_private_ips():
    assert is_ip_private_or_reserved("10.0.0.1") is True
    assert is_ip_private_or_reserved("192.168.1.1") is True
    assert is_ip_private_or_reserved("172.16.0.5") is True
    assert is_ip_private_or_reserved("8.8.8.8") is False

    with pytest.raises(InvalidURLException):
        validate_and_guard_url("http://10.0.0.1/private")


def test_ssrf_rejects_schemes():
    with pytest.raises(InvalidURLException):
        validate_and_guard_url("file:///etc/passwd")

    with pytest.raises(InvalidURLException):
        validate_and_guard_url("data:text/html,<html>")


def test_rejects_unsupported_domains():
    with pytest.raises(UnsupportedPlatformException):
        validate_and_guard_url("https://www.tiktok.com/@user/video/1234567", enforce_whitelist=True)

    with pytest.raises(UnsupportedPlatformException):
        validate_and_guard_url("https://www.pinterest.com/pin/123456789/", enforce_whitelist=True)


def test_rejects_invalid_hosts_and_private_tlds():
    with pytest.raises(InvalidURLException):
        validate_and_guard_url("http://nodotdomain/video.mp4")

    with pytest.raises(InvalidURLException):
        validate_and_guard_url("http://mycomputer.local/video.mp4")

    with pytest.raises(InvalidURLException):
        validate_and_guard_url("http://corp.internal/stream.m3u8")


def test_allows_valid_platform_and_universal_domains():
    valid_urls = [
        "https://www.instagram.com/p/C9w8q_L_11/",
        "https://x.com/user/status/123456",
        "https://twitter.com/user/status/123456",
        "https://www.facebook.com/watch/?v=123",
        "https://www.linkedin.com/posts/activity-123",
        "https://www.reddit.com/r/pics/comments/123456/",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtu.be/dQw4w9WgXcQ",
        "https://www.youtube.com/shorts/kJQP7kiw5Fk",
        "https://www.bcci.tv/videos/12345",
        "https://www.iplt20.com/video/45678",
        "https://drive.google.com/file/d/123456789/view",
    ]
    for u in valid_urls:
        assert validate_and_guard_url(u).startswith("https://")
