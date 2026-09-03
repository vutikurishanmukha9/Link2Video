import ipaddress
import socket
import urllib.parse
from typing import List, Optional
from app.core.exceptions import InvalidURLException, UnsupportedPlatformException


# Approved platform domain roots
ALLOWED_PLATFORM_DOMAINS = [
    "instagram.com",
    "instagr.am",
    "twitter.com",
    "x.com",
    "facebook.com",
    "fb.watch",
    "linkedin.com",
    "lnkd.in",
    "reddit.com",
    "redd.it",
    "youtube.com",
    "youtu.be",
]

# Disallowed schemes
DISALLOWED_SCHEMES = {"file", "data", "javascript", "ftp", "gopher", "dict", "ldap"}


def is_ip_private_or_reserved(ip_str: str) -> bool:
    """Check if an IP address belongs to private, loopback, link-local, or multicast blocks."""
    try:
        ip = ipaddress.ip_address(ip_str)
        # `is_private` does not cover every non-public range (for example the
        # carrier-grade NAT block 100.64.0.0/10). Outbound requests are safe
        # only to globally-routable addresses.
        return not ip.is_global
    except ValueError:
        return False


def validate_and_guard_url(
    raw_url: str,
    allowed_domains: Optional[List[str]] = None,
    enforce_whitelist: bool = False,
    resolve_dns: bool = False,
) -> str:
    """
    Strict SSRF validation:
    1. Rejects dangerous schemes (file:, data:, javascript:, etc.)
    2. Rejects localhost, 127.0.0.1, internal IP literals
    3. Rejects invalid hosts, missing TLDs, and private TLDs (.local, .internal, .lan, etc.)
    4. Optionally validates against explicit allowed domain whitelist if enforce_whitelist=True
    5. Optionally resolves hostname and verifies resolved IP is not internal
    """
    if not raw_url or not isinstance(raw_url, str):
        raise InvalidURLException("URL cannot be empty.")

    cleaned = raw_url.strip()
    initial_parsed = urllib.parse.urlsplit(cleaned)
    if initial_parsed.scheme and initial_parsed.scheme.lower() not in {"http", "https"}:
        raise InvalidURLException(f"Unsupported URL scheme '{initial_parsed.scheme}'.")

    if not cleaned.startswith(("http://", "https://")):
        cleaned = f"https://{cleaned}"

    parsed = urllib.parse.urlsplit(cleaned)

    # 1. Scheme validation
    if parsed.scheme.lower() not in {"http", "https"}:
        raise InvalidURLException(f"Unsupported URL scheme '{parsed.scheme}'.")

    hostname = parsed.hostname
    if not hostname:
        raise InvalidURLException("URL must contain a valid hostname.")

    hostname = hostname.lower()
    if parsed.username is not None or parsed.password is not None:
        raise InvalidURLException("URLs with embedded credentials are not allowed.")

    # 2. Check direct IP address or localhost
    if hostname in {"localhost", "127.0.0.1", "::1", "0.0.0.0"}:
        raise InvalidURLException("Access to internal localhost addresses is forbidden.")

    if is_ip_private_or_reserved(hostname):
        raise InvalidURLException("Access to private internal IP addresses is forbidden.")

    # 3. Host structure & private TLD defense
    if "." not in hostname or hostname.endswith("."):
        raise InvalidURLException(f"The host '{hostname}' is not a valid public web domain.")

    tld = hostname.split(".")[-1]
    if tld in {"local", "internal", "lan", "home", "corp", "test", "example", "invalid", "localhost", "onion"}:
        raise InvalidURLException(f"Access to private TLD '.{tld}' is forbidden.")

    # 4. Whitelist check (if explicit whitelist enforcement requested)
    if enforce_whitelist or allowed_domains is not None:
        allowed = allowed_domains or ALLOWED_PLATFORM_DOMAINS
        matched = any(
            hostname == domain or hostname.endswith(f".{domain}") for domain in allowed
        )
        if not matched:
            raise UnsupportedPlatformException(
                f"The domain '{hostname}' is not on the approved domain whitelist."
            )

    # 4. Optional DNS resolution check to prevent DNS rebinding attacks
    if resolve_dns:
        try:
            addr_info = socket.getaddrinfo(hostname, None)
            for item in addr_info:
                ip_addr = item[4][0]
                if is_ip_private_or_reserved(ip_addr):
                    raise InvalidURLException(
                        "URL resolves to an internal network address (SSRF blocked)."
                    )
        except socket.gaierror:
            raise InvalidURLException(f"Could not resolve host '{hostname}'.")

    return cleaned


def validate_safe_outbound_url(url: str) -> str:
    """
    Validate that an outbound media stream URL is public HTTP/HTTPS and
    does not point to local/private networks or cloud metadata services (e.g. AWS/GCP 169.254.169.254).
    """
    if not url or not isinstance(url, str):
        raise InvalidURLException("Outbound target URL cannot be empty.")

    parsed = urllib.parse.urlsplit(url.strip())
    if parsed.scheme.lower() not in {"http", "https"}:
        raise InvalidURLException(f"Blocked unsafe protocol scheme: '{parsed.scheme}'.")

    hostname = parsed.hostname
    if not hostname:
        raise InvalidURLException("Outbound URL must contain a valid hostname.")

    hostname = hostname.lower()
    if parsed.username is not None or parsed.password is not None:
        raise InvalidURLException("Outbound URLs with embedded credentials are not allowed.")
    if hostname in {"localhost", "127.0.0.1", "::1", "0.0.0.0", "169.254.169.254", "metadata.google.internal"}:
        raise InvalidURLException("Access to internal host address is strictly forbidden.")

    if is_ip_private_or_reserved(hostname):
        raise InvalidURLException("Access to private IP address is forbidden.")

    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for item in addr_info:
            ip_addr = item[4][0]
            if is_ip_private_or_reserved(ip_addr):
                raise InvalidURLException(
                    f"Outbound host '{hostname}' resolves to internal IP {ip_addr} (SSRF blocked)."
                )
    except socket.gaierror:
        # If hostname cannot be resolved (e.g. unit test mocks or offline environment), block known internal/local TLDs
        if hostname.endswith((".internal", ".local", ".localhost", ".corp", ".lan")):
            raise InvalidURLException(f"Blocked unresolvable internal host '{hostname}'.")

    return url
