from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, HttpUrl
from app.schemas.common import ErrorDetail
from app.schemas.media import MediaItemSchema


class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="Public social media post URL to analyze")


class PlatformInfo(BaseModel):
    name: str
    slug: str
    media: Optional[str] = None
    enabled: bool = True


class AnalyzeMeta(BaseModel):
    count: int = 0
    cached: bool = False
    duration_ms: Optional[int] = None


class AnalyzeResponse(BaseModel):
    success: bool = True
    request_id: str
    platform: Optional[PlatformInfo] = None
    author: Optional[str] = None
    posted_at: Optional[str] = None
    caption: Optional[str] = None
    media: List[MediaItemSchema] = Field(default_factory=list)
    meta: AnalyzeMeta = Field(default_factory=AnalyzeMeta)
    error: Optional[ErrorDetail] = None
