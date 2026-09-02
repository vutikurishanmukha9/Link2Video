from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from app.core.logging import logger


class Base(DeclarativeBase):
    pass


def get_engine() -> AsyncEngine:
    db_url = settings.DATABASE_URL

    # If user provided a postgres:// url (Neon default), convert to postgresql+asyncpg://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    connect_args = {}
    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False
        return create_async_engine(
            db_url,
            echo=settings.DATABASE_ECHO,
            connect_args=connect_args,
        )

    # Neon / asyncpg parameter cleanup:
    # asyncpg does NOT accept libpq arguments (e.g. channel_binding, sslmode, gssencmode)
    if "postgresql+asyncpg://" in db_url and "?" in db_url:
        import urllib.parse
        parsed = urllib.parse.urlsplit(db_url)
        q_params = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        safe_params = []
        has_ssl = False
        for k, v in q_params:
            if k == "sslmode":
                safe_params.append(("ssl", v if v != "require" else "require"))
                has_ssl = True
            elif k in {"channel_binding", "gssencmode", "target_session_attrs"}:
                # Strip unsupported libpq keyword arguments
                continue
            elif k == "ssl":
                safe_params.append((k, v))
                has_ssl = True
            else:
                safe_params.append((k, v))
        if not has_ssl:
            safe_params.append(("ssl", "require"))
        new_query = urllib.parse.urlencode(safe_params)
        db_url = urllib.parse.urlunsplit((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            new_query,
            parsed.fragment,
        ))

    # PostgreSQL / Neon settings with pooled connections & recycling
    return create_async_engine(
        db_url,
        echo=settings.DATABASE_ECHO,
        pool_size=10,
        max_overflow=20,
        pool_recycle=1800,
        pool_timeout=30,
        pool_pre_ping=True,
    )


engine = get_engine()
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables for local runs or tests."""
    try:
        import app.models.extraction  # noqa: F401
        import app.models.media  # noqa: F401

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
