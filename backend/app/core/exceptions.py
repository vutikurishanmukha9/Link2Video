from enum import Enum
from typing import Any, Dict, Optional


class ErrorCode(str, Enum):
    INVALID_URL = "INVALID_URL"
    UNSUPPORTED_PLATFORM = "UNSUPPORTED_PLATFORM"
    PRIVATE_CONTENT = "PRIVATE_CONTENT"
    CONTENT_NOT_FOUND = "CONTENT_NOT_FOUND"
    NO_MEDIA_FOUND = "NO_MEDIA_FOUND"
    EXTRACTION_FAILED = "EXTRACTION_FAILED"
    RATE_LIMITED = "RATE_LIMITED"
    DOWNLOAD_FAILED = "DOWNLOAD_FAILED"
    UPSTREAM_TIMEOUT = "UPSTREAM_TIMEOUT"
    UPSTREAM_BLOCKED = "UPSTREAM_BLOCKED"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class AppException(Exception):
    def __init__(
        self,
        code: ErrorCode,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class RateLimitExceededException(AppException):
    def __init__(self, message: str = "Rate limit exceeded. Please wait before retrying."):
        super().__init__(
            code=ErrorCode.RATE_LIMITED,
            message=message,
            status_code=429,
        )


class InvalidURLException(AppException):
    def __init__(self, message: str = "The provided URL is invalid or malformed."):
        super().__init__(
            code=ErrorCode.INVALID_URL,
            message=message,
            status_code=400,
        )


class UnsupportedPlatformException(AppException):
    def __init__(self, message: str = "This platform is not currently supported."):
        super().__init__(
            code=ErrorCode.UNSUPPORTED_PLATFORM,
            message=message,
            status_code=422,
        )


class PrivateContentException(AppException):
    def __init__(self, message: str = "This post is private and cannot be retrieved."):
        super().__init__(
            code=ErrorCode.PRIVATE_CONTENT,
            message=message,
            status_code=403,
        )


class NoMediaFoundException(AppException):
    def __init__(self, message: str = "No downloadable media was found at this URL."):
        super().__init__(
            code=ErrorCode.NO_MEDIA_FOUND,
            message=message,
            status_code=404,
        )


class ExtractionFailedException(AppException):
    def __init__(self, message: str = "Failed to extract media from this URL."):
        super().__init__(
            code=ErrorCode.EXTRACTION_FAILED,
            message=message,
            status_code=502,
        )
