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


def test_detect_tiktok():
    result = platform_detector.detect("https://www.tiktok.com/@creator/video/71234567890")
    assert result is not None
    assert result[0].slug == "tiktok"
    assert result[1].name == "TikTok"

    result_short = platform_detector.detect("https://vm.tiktok.com/ZMxxxxxx/")
    assert result_short is not None
    assert result_short[0].slug == "tiktok"


def test_detect_pinterest():
    result = platform_detector.detect("https://www.pinterest.com/pin/123456789/")
    assert result is not None
    assert result[0].slug == "pinterest"

    result_short = platform_detector.detect("https://pin.it/7abcxyz")
    assert result_short is not None
    assert result_short[0].slug == "pinterest"


def test_detect_threads():
    result = platform_detector.detect("https://www.threads.net/@zuck/post/C_abc123")
    assert result is not None
    assert result[0].slug == "threads"
    assert result[1].name == "Threads"


def test_detect_soundcloud():
    result = platform_detector.detect("https://soundcloud.com/artist/track-title")
    assert result is not None
    assert result[0].slug == "soundcloud"
    assert result[1].name == "SoundCloud"


def test_detect_bandcamp():
    result = platform_detector.detect("https://artist.bandcamp.com/track/song-name")
    assert result is not None
    assert result[0].slug == "bandcamp"
    assert result[1].name == "Bandcamp"


def test_detect_twitch():
    result = platform_detector.detect("https://clips.twitch.tv/GloriousClip123")
    assert result is not None
    assert result[0].slug == "twitch"
    assert result[1].name == "Twitch"


def test_invalid_scheme_returns_none():
    assert platform_detector.detect("") is None
    assert platform_detector.detect("ftp://example.com/video.mp4") is None
