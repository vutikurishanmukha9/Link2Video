import pytest
from app.services.platform_detector import platform_detector


def test_detect_instagram():
    result = platform_detector.detect("https://instagram.com/reel/C8v9z8_L_2m/")
    assert result is not None
    adapter, info = result
    assert adapter.slug == "instagram"
    assert info.name == "Instagram"


def test_detect_x_and_twitter():
    result_x = platform_detector.detect("https://x.com/user/status/12345")
    assert result_x is not None
    assert result_x[0].slug == "x"

    result_tw = platform_detector.detect("https://twitter.com/user/status/12345")
    assert result_tw is not None
    assert result_tw[0].slug == "x"


def test_detect_facebook():
    result = platform_detector.detect("https://www.facebook.com/watch/?v=999")
    assert result is not None
    assert result[0].slug == "facebook"


def test_detect_linkedin():
    result = platform_detector.detect("https://www.linkedin.com/posts/activity-12345")
    assert result is not None
    assert result[0].slug == "linkedin"


def test_detect_reddit():
    result = platform_detector.detect("https://www.reddit.com/r/pics/comments/abc/photo/")
    assert result is not None
    assert result[0].slug == "reddit"


def test_detect_universal_web_bcci():
    result = platform_detector.detect("https://www.bcci.tv/videos/556677/match-highlights")
    assert result is not None
    adapter, info = result
    assert adapter.slug == "web"
    assert info.name == "BCCI"


def test_detect_universal_web_ipl():
    result = platform_detector.detect("https://www.iplt20.com/video/12345/final-over-thriller")
    assert result is not None
    adapter, info = result
    assert adapter.slug == "web"
    assert info.name == "IPL"


def test_detect_universal_web_google_drive():
    result = platform_detector.detect("https://drive.google.com/file/d/1A2B3C4D/view")
    assert result is not None
    adapter, info = result
    assert adapter.slug == "web"
    assert info.name == "Google Drive"


def test_invalid_scheme_returns_none():
    assert platform_detector.detect("") is None
    assert platform_detector.detect("ftp://example.com/video.mp4") is None
