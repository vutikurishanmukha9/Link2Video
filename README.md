# Link 2 Download

Link 2 Download is a high-performance, production-grade media downloader application designed to extract and stream public photos, carousels, videos, and reels from major social platforms without requiring third-party accounts or intrusive tracking.

Supported platforms:
- Instagram (Reels, Carousels, Posts)
- YouTube (Shorts, Standard Videos, MP4)
- X / Twitter (Videos, Photos, GIFs)
- Facebook (Public Videos and Watch content)
- LinkedIn (Public Video updates and Slides)
- Reddit (Native Video with audio and Image galleries)

---

## Architectural Overview

Link 2 Download is architected as a decoupled client-server application adhering to strict production engineering standards:

```text
+-------------------------+            HTTPS / REST            +-------------------------+
|     Vite / React        | ---------------------------------> |     FastAPI (Python)    |
|   TanStack Start        | <--------------------------------- |    Async Backend Engine |
|   Tailwind Design Sys   |       Structured JSON / Stream     +------------+------------+
+-------------------------+                                                 |
                                                                            |
                                               +----------------------------+----------------------------+
                                               |                            |                            |
                                               v                            v                            v
                                    +--------------------+       +--------------------+       +--------------------+
                                    |    PostgreSQL      |       |       Redis        |       |    yt-dlp Engine   |
                                    |  Neon / SQLite     |       |  Upstash / Memory  |       |  Upstream Stream   |
                                    |  Persistent Store  |       |  Cache & RateLimit |       |  Extractor         |
                                    +--------------------+       +--------------------+       +--------------------+
```

### Frontend
- Framework: Vite 8 with TanStack Start and React 19.
- Styling: Custom design tokens, high-contrast hybrid surface hierarchy, and Tailwind CSS.
- Communication: Asynchronous REST client with automatic timeout guards and error boundary translation.

### Backend
- Framework: FastAPI (Python 3.12) running under Uvicorn with asynchronous event loops.
- Storage: SQLAlchemy 2.0 async engine with connection recycling (`pool_recycle=1800`), pre-ping validation, and Alembic migrations. Supports PostgreSQL (Neon) and local SQLite (`./dev.db`).
- Cache & Rate Limiting: Redis client (Upstash compatible) with in-memory fallback for local development.
- Media Extraction: Asynchronous thread executor wrapping `yt-dlp` with browser header emulation and progressive stream prioritization.

---

## Core Capabilities

### 1. Progressive Stream Prioritization
Social platforms frequently separate video tracks from audio tracks. The extraction service inspects all available format containers and prioritizes progressive MP4 formats that combine both audio and video streams, ensuring downloaded videos retain full audio synchronization.

### 2. Chunked Streaming Downloads
Many origin CDNs serve media with inline disposition headers, causing browsers to open media in a new tab instead of downloading. Link 2 Download provides a dedicated streaming proxy endpoint (`GET /api/v1/media/{media_id}/download?stream=true`) that pipes binary data in 64 KB chunks with explicit `Content-Disposition: attachment` headers, guaranteeing one-click downloads directly to user disk.

### 3. Strict SSRF Protection
The input validation layer guards against Server-Side Request Forgery:
- Enforces strict whitelist validation against verified platform hosts.
- Prohibits non-HTTP schemes (`file:`, `data:`, `javascript:`, `ftp:`).
- Blocks private and reserved IP blocks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, IPv6 loopbacks).

### 4. Zero Mock Leaks
No artificial data, demo buttons, or canned stock photos exist in the production runtime. Every request is resolved against real origin platform networks, with authentic error codes returned when content is deleted, private, or inaccessible.

---

## API Specification

### 1. Analyze Post URL
Retrieves media streams, dimensions, formats, author metadata, and thumbnail previews.

- Method: `POST`
- Path: `/api/v1/analyze`
- Headers: `Content-Type: application/json`
- Request Body:
  ```json
  {
    "url": "https://www.instagram.com/reel/C8v9z8_L_2m/"
  }
  ```
- Success Response (HTTP 200):
  ```json
  {
    "success": true,
    "request_id": "req_1788342153620_a1b2c3d4",
    "platform": {
      "slug": "instagram",
      "name": "Instagram"
    },
    "author": "@creator",
    "posted_at": "Aug 28, 2026",
    "caption": "Public post description",
    "media": [
      {
        "id": "ig-12345",
        "type": "video",
        "url": "https://scontent.cdninstagram.com/...",
        "thumbnail_url": "https://scontent.cdninstagram.com/...",
        "width": 1080,
        "height": 1920,
        "duration": 34.0,
        "format": "mp4",
        "size": 14850000,
        "title": "Instagram Video"
      }
    ],
    "meta": {
      "count": 1,
      "cached": false,
      "duration_ms": 842
    }
  }
  ```

### 2. Media Download
Resolves direct download targets or streams the binary payload with forced attachment headers.

- Method: `GET`
- Path: `/api/v1/media/{media_id}/download`
- Query Parameters:
  - `stream` (boolean, default: `false`): When `true`, returns a chunked binary stream with `Content-Disposition: attachment`.
  - `redirect` (boolean, default: `false`): When `true`, returns an HTTP 307 redirect directly to origin CDN.
- Response (when `stream=false` and `redirect=false`):
  ```json
  {
    "direct_url": "https://scontent.cdninstagram.com/...",
    "filename": "ig-12345.mp4",
    "content_type": "video/mp4"
  }
  ```

### 3. System Diagnostics
Evaluates application liveness, database query response latency, and Redis connectivity.

- Method: `GET`
- Path: `/api/v1/health`
- Success Response (HTTP 200):
  ```json
  {
    "status": "healthy",
    "environment": "production",
    "version": "1.0.0",
    "diagnostics": {
      "database": {
        "status": "connected",
        "latency_ms": 2
      },
      "redis": {
        "status": "connected"
      }
    }
  }
  ```

### 4. Error Structure
All failures return uniform JSON payloads:
```json
{
  "success": false,
  "request_id": "req_1788342153620_a1b2c3d4",
  "error": {
    "code": "PRIVATE_CONTENT",
    "message": "This content is private, restricted, or requires an account to view.",
    "details": null
  }
}
```

Standard Error Codes:
- `INVALID_URL`: Malformed syntax, unsupported scheme, or SSRF boundary violation (HTTP 400 / 422).
- `UNSUPPORTED_PLATFORM`: Domain is not in the approved platform registry (HTTP 422).
- `PRIVATE_CONTENT`: Post requires account credentials or group authorization (HTTP 403).
- `NO_MEDIA_FOUND`: Post contains only text or media assets were removed (HTTP 404).
- `RATE_LIMITED`: Request volume exceeded client threshold (HTTP 429).
- `PAYLOAD_TOO_LARGE`: Request body exceeded 64 KB safety limit (HTTP 413).
- `EXTRACTION_FAILED`: Upstream platform network failure or invalid response (HTTP 502).
- `INTERNAL_ERROR`: Unhandled backend exception (HTTP 500).

---

## Local Development Setup

### Prerequisites
- Node.js 18.0 or higher
- Python 3.10 or higher
- Git

### One-Click Startup (Windows)
Run the root batch script to automatically activate the Python virtual environment and start both servers:
```cmd
run-local.bat
```

### Manual Setup

#### 1. Backend Service
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
Backend will be accessible at: `http://localhost:8000` (API documentation at `/docs` in development).

#### 2. Frontend Application
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be accessible at: `http://localhost:3000`.

---

## Environment Configuration

Configuration is managed via environment variables. Create `.env` files in `backend/` and `frontend/` as needed.

### Backend (`backend/.env`)
```ini
APP_NAME=Link2Download
APP_ENV=development
SECRET_KEY=replace-with-a-secure-random-string-in-production
ALLOWED_HOSTS=*
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]

# Database: Leave as sqlite for local development, or supply Neon PostgreSQL URL
DATABASE_URL=sqlite+aiosqlite:///./dev.db
DATABASE_ECHO=false

# Redis: Optional. If omitted, built-in thread-safe memory client is used
REDIS_URL=
REDIS_ENABLED=false

# Rate Limiting
RATE_LIMIT_ANALYZE=20
RATE_LIMIT_WINDOW_SECONDS=60
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:8000
```

---

## Quality Assurance & Automated Testing

### Backend Test Suite
The backend contains 27 automated tests covering platform detection, URL sanitization, SSRF protection, caching, rate limiting, and binary streaming.

```bash
cd backend
.\.venv\Scripts\pytest.exe -v
```

### Frontend Verification
```bash
cd frontend

# Linting
npm run lint

# Production build bundle check
npm run build
```

---

## Project Structure

```text
Link2Video/
├── backend/
│   ├── app/
│   │   ├── api/v1/            # HTTP Route handlers (analyze, media, health)
│   │   ├── core/              # Config, async database engine, redis, exceptions
│   │   ├── models/            # SQLAlchemy database schemas (requests, media)
│   │   ├── platforms/         # Platform adapters (Instagram, X, FB, LinkedIn, Reddit)
│   │   ├── schemas/           # Pydantic models for validation and serialization
│   │   ├── services/          # RealMediaExtractor, DownloaderService, RateLimiter
│   │   └── utils/             # SSRF guard, URL normalizer, IP hashing
│   ├── migrations/            # Alembic schema migrations
│   ├── tests/                 # Full pytest automated test suite
│   └── requirements.txt       # Python package dependencies
├── frontend/
│   ├── public/                # Static assets, wordmark, favicons
│   ├── src/
│   │   ├── components/
│   │   │   ├── brand/         # BrandWordmark typography component
│   │   │   ├── downloader/    # UrlCommandBar, Workspace, MediaCards
│   │   │   ├── platform/      # Restrained monochrome platform indicators
│   │   │   └── site/          # Navigation, hero, sections, footer
│   │   ├── lib/               # Downloader client, error mapping, API connectors
│   │   ├── routes/            # TanStack Start file-based routing (__root, index)
│   │   └── styles.css         # Tailwind tokens and design system hairlines
│   └── package.json           # Node.js dependencies and build scripts
├── run-local.bat              # One-click local development launcher
└── README.md                  # System documentation
```

---

## Legal & Compliance Notice

Link 2 Download is designed solely for public content archiving and media retrieval. It does not circumvent digital rights management (DRM), authentication gates, or private account restrictions. Users are responsible for complying with the terms of service of respective source platforms and applicable copyright laws in their jurisdiction.
