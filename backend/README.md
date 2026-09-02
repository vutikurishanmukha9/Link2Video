# Conduit Backend API

High-performance, asynchronous FastAPI backend for the Conduit Multi-Platform Media Downloader.

Designed to deploy seamlessly to **Render** with **Neon PostgreSQL** and **Upstash Redis**, serving the **Vercel-hosted frontend**.

---

## Architecture Overview

```text
USER
 │
 ▼ https://your-domain.com
VERCEL (Frontend client)
 │
 │ HTTPS / REST (POST /api/v1/analyze)
 ▼ https://your-api.onrender.com
RENDER (FastAPI Web Service)
 ├── Security & SSRF Guard (Domain allowlist, IP validator)
 ├── Upstash Redis (Sliding-window rate limiter & 10m cache)
 ├── Platform Adapters (Instagram, X, Facebook, LinkedIn, Reddit)
 └── Neon PostgreSQL (Request tracking, media metadata, platform error analytics)
```

> [!NOTE]
> **No media is stored in Neon or Render**: Large binary files (MP4/JPG) are never saved into PostgreSQL or the ephemeral Render container disk. Conduit extracts and resolves public streaming URLs directly from origin CDN edges to the user.

---

## Directory Layout

```text
backend/
├── app/
│   ├── main.py                     # FastAPI application factory, CORS, exception handlers
│   ├── api/
│   │   ├── router.py               # Main API router mounting v1
│   │   └── v1/
│   │       ├── health.py           # GET /api/v1/health (Render healthcheck)
│   │       ├── platforms.py        # GET /api/v1/platforms (Supported platforms list)
│   │       ├── analyze.py          # POST /api/v1/analyze (Core extraction endpoint)
│   │       └── media.py            # GET /api/v1/media/{id}/download
│   ├── core/
│   │   ├── config.py               # Pydantic Settings & environment variables
│   │   ├── database.py             # SQLAlchemy 2 async engine (Neon PostgreSQL & SQLite)
│   │   ├── redis.py                # Upstash Redis async client & in-memory fallback
│   │   ├── logging.py              # Structured JSON request logging
│   │   └── exceptions.py           # Standardized error codes & AppException
│   ├── models/                     # SQLAlchemy ORM models
│   ├── schemas/                    # Pydantic v2 validation & response schemas
│   ├── services/                   # Business logic (analyzer, cache, rate_limiter, detector)
│   ├── platforms/                  # Platform adapters (Instagram, X, Facebook, LinkedIn, Reddit)
│   └── utils/                      # SSRF security guard, URL canonicalizer, validators
├── migrations/                     # Alembic database migrations
├── tests/                          # Automated Pytest suite
├── requirements.txt                # Python dependencies
├── alembic.ini                     # Alembic config
└── .env.example                    # Environment variable template
```

---

## Local Development Setup

### 1. Requirements
- Python 3.12+
- pip

### 2. Install Dependencies
```bash
cd backend
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(By default, `.env` uses local SQLite and in-memory Redis, so no external accounts are required for local testing!)*

### 4. Run the Dev Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Run Automated Tests
```bash
pytest
```

---

## API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/v1/health`
- **Response**: `{"status": "ok", "redis": "ok"}`

### 2. Supported Platforms
- **Endpoint**: `GET /api/v1/platforms`
- **Response**:
```json
{
  "platforms": [
    { "name": "Instagram", "slug": "instagram", "media": "Photos · Videos · Reels", "enabled": true },
    { "name": "X", "slug": "x", "media": "Photos · Videos · GIFs", "enabled": true }
  ]
}
```

### 3. Analyze Post URL
- **Endpoint**: `POST /api/v1/analyze`
- **Body**: `{"url": "https://www.instagram.com/reel/C8v9z8_L_2m/"}`
- **Response**:
```json
{
  "success": true,
  "request_id": "req_1725280000000_abc123",
  "platform": {
    "name": "Instagram",
    "slug": "instagram"
  },
  "author": "@northfield.studio",
  "posted_at": "Aug 28, 2026",
  "caption": "Workshop notes from the second build week...",
  "media": [
    {
      "id": "ig-reel-1",
      "type": "video",
      "url": "https://...",
      "thumbnail_url": "https://...",
      "width": 1080,
      "height": 1920,
      "duration": 34.0,
      "format": "mp4",
      "size": 14850000
    }
  ],
  "meta": {
    "count": 1,
    "cached": false,
    "duration_ms": 42
  }
}
```

---

## Production Deployment to Render

1. Create a **New Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/v1/health`
4. Set Environment Variables in Render Dashboard:
   - `APP_ENV`: `production`
   - `DATABASE_URL`: *Your Neon pooled connection string* (`postgresql+asyncpg://...`)
   - `REDIS_URL`: *Your Upstash Redis connection URI* (`rediss://...`)
   - `FRONTEND_URL`: *Your Vercel domain* (`https://your-frontend.vercel.app`)
   - `RATE_LIMIT_ANALYZE`: `10`
   - `RATE_LIMIT_WINDOW_SECONDS`: `60`
