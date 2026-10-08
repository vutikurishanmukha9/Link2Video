import base64
import json
import random
import re
import struct
import urllib.parse
from typing import Optional, Tuple
import httpx
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from app.core.exceptions import (
    ExtractionFailedException,
    NoMediaFoundException,
    PrivateContentException,
)
from app.core.logging import logger
from app.platforms.base import ExtractionResult, PlatformAdapter
from app.schemas.media import MediaItemSchema


def _base64_url_decode(data: str) -> bytes:
    """Pad and decode base64url data."""
    data = data.replace("-", "+").replace("_", "/")
    data += "=" * (-len(data) % 4)
    return base64.b64decode(data)


def _derive_mega_key_and_iv(key_b64: str) -> Tuple[bytes, bytes]:
    """
    Derive 128-bit AES key and AES-CTR initial IV from Mega 256-bit (32-byte) key.
    Mega combines 8 32-bit big-endian words into 4 words via XOR.
    """
    raw_key = _base64_url_decode(key_b64)
    if len(raw_key) != 32:
        raise ValueError(f"Invalid Mega key length: expected 32 bytes, got {len(raw_key)}")

    words = struct.unpack(">8I", raw_key)
    derived_key = struct.pack(
        ">4I",
        words[0] ^ words[4],
        words[1] ^ words[5],
        words[2] ^ words[6],
        words[3] ^ words[7],
    )
    # IV has first 2 words from words[4], words[5], followed by zero counter
    iv = struct.pack(">4I", words[4], words[5], 0, 0)
    return derived_key, iv


def _decrypt_mega_attributes(at_b64: str, derived_key: bytes) -> dict:
    """Decrypt Mega file attributes (contains {"n": "filename"}) using AES-128-CBC."""
    at_bytes = _base64_url_decode(at_b64)
    # Mega attributes use all-zeros IV for CBC
    iv_zero = b"\x00" * 16
    cipher = Cipher(algorithms.AES(derived_key), modes.CBC(iv_zero))
    decryptor = cipher.decryptor()
    decrypted = decryptor.update(at_bytes) + decryptor.finalize()

    # Strips null padding and Mega prefix
    dec_str = decrypted.decode("utf-8", errors="replace")
    if dec_str.startswith("MEGA"):
        dec_str = dec_str[4:]
    dec_str = dec_str.strip("\x00")

    try:
        return json.loads(dec_str)
    except Exception:
        # Fallback regex extraction of name if JSON trailing garbage exists
        name_match = re.search(r'"n"\s*:\s*"([^"]+)"', dec_str)
        if name_match:
            return {"n": name_match.group(1)}
        return {"n": "Mega_File.mp4"}


class MegaAdapter(PlatformAdapter):
    """
    Mega Cloud Storage Adapter:
    Resolves shared file metadata, extracts direct CDN node URLs, and
    enables streaming of decrypted progressive bytes without desktop or mobile app.
    """

    name = "Mega"
    slug = "mega"
    media_types_description = "Decrypted File Stream · Direct 1080p · No App"
    hosts = ["mega.nz", "mega.io", "mega.co.nz"]

    def can_handle(self, url: str) -> bool:
        try:
            parsed = urllib.parse.urlsplit(url)
            host = parsed.netloc.lower().split(":")[0].replace("www.", "")
            return host in self.hosts or any(host.endswith(f".{h}") for h in self.hosts)
        except Exception:
            return False

    def _parse_file_link(self, url: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract (file_id, file_key) from new or legacy Mega URL."""
        # Pattern 1: https://mega.nz/file/{file_id}#{file_key}
        m = re.search(r"/file/([a-zA-Z0-9_-]{8,})#([a-zA-Z0-9_-]{22,})", url)
        if m:
            return m.group(1), m.group(2)

        # Pattern 2: legacy https://mega.co.nz/#!{file_id}!{file_key}
        m2 = re.search(r"#!([a-zA-Z0-9_-]{8,})!([a-zA-Z0-9_-]{22,})", url)
        if m2:
            return m2.group(1), m2.group(2)

        # Pattern 3: URL without key fragment
        m3 = re.search(r"/file/([a-zA-Z0-9_-]{8,})", url)
        if m3:
            return m3.group(1), None

        return None, None

    async def analyze(self, url: str) -> ExtractionResult:
        file_id, file_key = self._parse_file_link(url)
        if not file_id:
            raise ExtractionFailedException("Invalid Mega URL. Expected format: mega.nz/file/{id}#{key}")

        if not file_key:
            raise PrivateContentException(
                "Mega decryption key is missing. Shared links require the #key fragment to decrypt."
            )

        try:
            derived_key, iv = _derive_mega_key_and_iv(file_key)
        except Exception as e:
            logger.error(f"Failed to derive Mega key for {file_id}: {e}")
            raise ExtractionFailedException("Unable to decode Mega decryption key.")

        # Request file node info from Mega CS API
        seq = random.randint(10000000, 99999999)
        api_url = f"https://g.api.mega.co.nz/cs?id={seq}"
        payload = [{"a": "g", "g": 1, "p": file_id}]

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(api_url, json=payload)
                if resp.status_code != 200:
                    raise ExtractionFailedException(f"Mega API error: HTTP {resp.status_code}")
                data = resp.json()
            except Exception as e:
                logger.error(f"Mega API connection failed: {e}")
                raise ExtractionFailedException("Failed to connect to Mega API.")

        if isinstance(data, list) and len(data) > 0:
            node = data[0]
            if isinstance(node, int):
                # Negative int indicates Mega error code (-11: file not found, -16: user blocked, etc.)
                if node == -11:
                    raise NoMediaFoundException("This Mega file was removed or does not exist.")
                if node == -16:
                    raise PrivateContentException("Access to this Mega file is restricted.")
                raise ExtractionFailedException(f"Mega API returned error code {node}")

            file_size = int(node.get("s") or 0)
            at_b64 = node.get("at")
            direct_g_url = node.get("g")

            if not direct_g_url:
                raise ExtractionFailedException("Could not retrieve Mega direct download node.")

            attributes = _decrypt_mega_attributes(at_b64, derived_key) if at_b64 else {}
            filename = attributes.get("n") or f"mega_{file_id}.mp4"
            ext = filename.rsplit(".", 1)[-1].upper() if "." in filename else "MP4"

            is_video = ext.lower() in ["mp4", "mkv", "mov", "webm", "avi", "ts", "m4v"]

            # Encode mega stream proxy descriptor
            encoded_g = urllib.parse.quote(direct_g_url, safe="")
            encoded_fn = urllib.parse.quote(filename, safe="")
            proxy_stream_url = (
                f"mega_stream://{file_id}?key={file_key}&g={encoded_g}&size={file_size}&fn={encoded_fn}"
            )

            media_item = MediaItemSchema(
                id=f"mega-{file_id}",
                type="video" if is_video else "image",
                url=proxy_stream_url,
                thumbnail_url=None,
                width=1920 if is_video else 1080,
                height=1080 if is_video else 1080,
                duration=None,
                format=ext,
                size=file_size,
                title=filename,
            )

            return ExtractionResult(
                platform=self.name,
                author="@mega.nz",
                posted_at="Recently",
                caption=filename,
                media=[media_item],
            )

        raise ExtractionFailedException("Invalid response received from Mega API.")
