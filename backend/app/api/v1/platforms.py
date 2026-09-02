from typing import Any, Dict, List
from fastapi import APIRouter
from app.platforms.registry import platform_registry
from app.schemas.analyze import PlatformInfo

router = APIRouter()


@router.get("/platforms", summary="List supported platforms")
async def list_platforms() -> Dict[str, List[PlatformInfo]]:
    """Return all active supported platforms and supported media types."""
    adapters = platform_registry.get_all()
    platforms = [
        PlatformInfo(
            name=a.name,
            slug=a.slug,
            media=a.media_types_description,
            enabled=True,
        )
        for a in adapters
    ]
    return {"platforms": platforms}
