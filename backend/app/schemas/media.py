from typing import Literal, Optional
from pydantic import BaseModel, Field


class MediaItemSchema(BaseModel):
    id: str
    type: Literal["video", "image"]
    url: str
    thumbnail_url: Optional[str] = None
    width: int = Field(default=1080, ge=0)
    height: int = Field(default=1080, ge=0)
    duration: Optional[float] = Field(default=None, ge=0)
    format: str = Field(default="mp4")
    size: int = Field(default=0, ge=0, description="File size in bytes")
    title: Optional[str] = None


class DownloadResponse(BaseModel):
    direct_url: str
    filename: str
    content_type: str
