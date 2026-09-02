from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.media import MediaItemSchema


class ExtractionResult(BaseModel):
    platform: str
    author: str
    posted_at: str
    caption: str
    media: List[MediaItemSchema] = Field(default_factory=list)


class PlatformAdapter(ABC):
    name: str
    slug: str
    media_types_description: str
    hosts: List[str]

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        """Return True if this adapter can process the given URL."""
        pass

    @abstractmethod
    async def analyze(self, url: str) -> ExtractionResult:
        """Extract public metadata and media from the post URL."""
        pass
