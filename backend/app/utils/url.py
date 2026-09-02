import urllib.parse
from typing import Optional


# Tracking parameters to strip for clean canonical caching
TRACKING_PARAMS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "igsh",
    "igshid",
    "s",
    "t",
    "ref",
    "ref_src",
    "source",
    "mibextid",
}


def normalize_url(raw: str) -> str:
    """Normalize and canonicalize public URLs for clean deduplicated caching."""
    cleaned = raw.strip()
    if not cleaned:
        return ""

    if not cleaned.startswith(("http://", "https://")):
        cleaned = f"https://{cleaned}"

    parsed = urllib.parse.urlsplit(cleaned)
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()

    # Remove default ports
    if netloc.endswith(":80") and scheme == "http":
        netloc = netloc[:-3]
    elif netloc.endswith(":443") and scheme == "https":
        netloc = netloc[:-4]

    # Strip tracking query parameters
    query_parts = urllib.parse.parse_qsl(parsed.query, keep_blank_values=False)
    filtered_query = [
        (k, v) for k, v in query_parts if k.lower() not in TRACKING_PARAMS
    ]
    new_query = urllib.parse.urlencode(filtered_query)

    # Normalize path (remove redundant slashes)
    path = parsed.path
    if not path:
        path = "/"

    return urllib.parse.urlunsplit((scheme, netloc, path, new_query, ""))


def extract_domain(url: str) -> Optional[str]:
    """Extract stripped hostname without www."""
    try:
        parsed = urllib.parse.urlsplit(url if "://" in url else f"https://{url}")
        host = parsed.netloc.lower().split(":")[0]
        if host.startswith("www."):
            host = host[4:]
        return host if "." in host else None
    except Exception:
        return None
