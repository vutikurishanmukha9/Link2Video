import hashlib
import time
import uuid


def generate_request_id() -> str:
    """Generate high-entropy unique request ID."""
    timestamp = int(time.time() * 1000)
    rand_part = uuid.uuid4().hex[:12]
    return f"req_{timestamp}_{rand_part}"


def hash_url(url: str) -> str:
    """Generate SHA-256 hash string for caching keys."""
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def hash_client_ip(ip: str) -> str:
    """Hash client IP to respect user privacy while allowing rate limiting."""
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()[:16]
