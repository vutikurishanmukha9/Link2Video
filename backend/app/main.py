import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from app.api.router import api_router
from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import AppException, ErrorCode
from app.core.logging import logger
from app.core.redis import redis_manager
from app.utils.validators import generate_request_id


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for database & redis lifecycle."""
    logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode...")
    await init_db()
    await redis_manager.connect()
    yield
    await redis_manager.disconnect()
    logger.info("Application shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# 18. Strict CORS Middleware (supports explicit origins, Vercel deployments, and wildcard)
has_wildcard = "*" in settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://.*\.vercel\.app$",
    allow_credentials=not has_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# GZip compression for responses > 1KB (reduces network payload size by ~70%)
app.add_middleware(GZipMiddleware, minimum_size=1000)


class NormalizePathMiddleware:
    """Collapses consecutive duplicate slashes in URLs (e.g. //api/v1/analyze -> /api/v1/analyze)"""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in {"http", "websocket"}:
            path = scope.get("path", "")
            if "//" in path:
                import re
                scope["path"] = re.sub(r"/+", "/", path)
        await self.app(scope, receive, send)


app.add_middleware(NormalizePathMiddleware)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """Assigns unique request ID, enforces payload limits, and injects security headers."""
    request_id = request.headers.get("X-Request-ID") or generate_request_id()
    request.state.request_id = request_id
    start_time = time.time()

    # Payload size guard (max 64KB)
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 65536:
                return JSONResponse(
                    status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                    content={
                        "success": False,
                        "request_id": request_id,
                        "error": {
                            "code": "PAYLOAD_TOO_LARGE",
                            "message": "Request payload exceeds maximum allowed size (64KB).",
                        },
                    },
                )
        except ValueError:
            pass

    response = await call_next(request)

    duration_ms = int((time.time() - start_time) * 1000)
    response.headers["X-Request-ID"] = request_id

    # Production-grade Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Log non-healthcheck requests
    if "/health" not in request.url.path:
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )

    return response


# Global Exception Handlers (Section 29 & 30)
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    req_id = getattr(request.state, "request_id", generate_request_id())
    headers = {}
    if exc.code == ErrorCode.RATE_LIMITED:
        headers["Retry-After"] = str(settings.RATE_LIMIT_WINDOW_SECONDS)
        headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_ANALYZE)
        headers["X-RateLimit-Remaining"] = "0"

    return JSONResponse(
        status_code=exc.status_code,
        headers=headers,
        content={
            "success": False,
            "request_id": req_id,
            "error": {
                "code": exc.code.value,
                "message": exc.message,
                "details": exc.details,
            },
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", generate_request_id())
    err_msg = exc.errors()[0].get("msg", "Invalid request parameters.") if exc.errors() else "Validation error."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "request_id": req_id,
            "error": {
                "code": ErrorCode.INVALID_URL.value,
                "message": f"Validation error: {err_msg}",
            },
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", generate_request_id())
    logger.error(
        f"Unhandled server error: {str(exc)}",
        exc_info=True,
        extra={"request_id": req_id, "path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "request_id": req_id,
            "error": {
                "code": ErrorCode.INTERNAL_ERROR.value,
                "message": "An internal unexpected server error occurred.",
            },
        },
    )


# Mount API routers under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "health": f"{settings.API_V1_STR}/health",
        "docs": "/docs" if not settings.is_production else None,
    }
