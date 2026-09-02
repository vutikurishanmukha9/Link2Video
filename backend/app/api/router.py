from fastapi import APIRouter
from app.api.v1 import analyze, health, media, platforms

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(platforms.router, tags=["Platforms"])
api_router.include_router(analyze.router, tags=["Extraction"])
api_router.include_router(media.router, tags=["Media"])
