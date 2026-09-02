from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class MediaItemModel(Base):
    __tablename__ = "media_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    media_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    media_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "video" or "image"
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    width: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    height: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    format: Mapped[str] = mapped_column(String(20), default="mp4", nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )
