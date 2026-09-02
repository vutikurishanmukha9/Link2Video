"""initial schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-09-02 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. platforms table
    op.create_table(
        "platforms",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("slug", sa.String(length=50), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_platforms_slug", "platforms", ["slug"], unique=True)

    # 2. extraction_requests table
    op.create_table(
        "extraction_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("request_id", sa.String(length=64), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("platform", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_code", sa.String(length=50), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_extraction_requests_request_id", "extraction_requests", ["request_id"], unique=True)
    op.create_index("ix_extraction_requests_platform", "extraction_requests", ["platform"])
    op.create_index("ix_extraction_requests_status", "extraction_requests", ["status"])
    op.create_index("ix_extraction_requests_created_at", "extraction_requests", ["created_at"])

    # 3. media_items table
    op.create_table(
        "media_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("request_id", sa.String(length=64), nullable=False),
        sa.Column("media_id", sa.String(length=64), nullable=False),
        sa.Column("media_type", sa.String(length=20), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("thumbnail_url", sa.Text(), nullable=True),
        sa.Column("width", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("height", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration", sa.Float(), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("format", sa.String(length=20), nullable=False, server_default="mp4"),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_media_items_request_id", "media_items", ["request_id"])
    op.create_index("ix_media_items_media_id", "media_items", ["media_id"])

    # 4. extraction_errors table
    op.create_table(
        "extraction_errors",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("request_id", sa.String(length=64), nullable=False),
        sa.Column("platform", sa.String(length=50), nullable=False),
        sa.Column("error_code", sa.String(length=50), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_extraction_errors_request_id", "extraction_errors", ["request_id"])
    op.create_index("ix_extraction_errors_platform", "extraction_errors", ["platform"])
    op.create_index("ix_extraction_errors_created_at", "extraction_errors", ["created_at"])


def downgrade() -> None:
    op.drop_table("extraction_errors")
    op.drop_table("media_items")
    op.drop_table("extraction_requests")
    op.drop_table("platforms")
