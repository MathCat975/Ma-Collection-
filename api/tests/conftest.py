import asyncio
import os
import re
from collections.abc import Generator
from pathlib import Path
from urllib.parse import urlsplit
from uuid import uuid4

import pytest
from dotenv import dotenv_values
from sqlalchemy.schema import CreateSchema, DropSchema
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool


api_directory = Path(__file__).resolve().parents[1]
test_url = os.getenv("TEST_DATABASE_URL", "")
test_host = urlsplit(test_url).hostname or ""
expected_host = os.getenv(
    "TEST_DATABASE_HOST",
    "ep-purple-pine-b2xxdy2b.c-6.eu-central-1.aws.neon.tech",
)

if urlsplit(test_url).scheme not in {
    "postgres",
    "postgresql",
    "postgresql+asyncpg",
}:
    raise pytest.UsageError("Définissez TEST_DATABASE_URL avec une base PostgreSQL de test.")


def database_target(value: str) -> tuple[str, str]:
    parts = urlsplit(value)
    return ((parts.hostname or "").replace("-pooler", ""), parts.path)


for production_url in (
    os.getenv("DATABASE_URL", ""),
    dotenv_values(api_directory / ".env").get("DATABASE_URL") or "",
    dotenv_values(api_directory.parent / ".env.local").get("DATABASE_URL") or "",
):
    if production_url and database_target(test_url) == database_target(production_url):
        raise pytest.UsageError("La base de test correspond à la base de l'application.")

if test_host.replace("-pooler", "") != expected_host.replace("-pooler", ""):
    raise pytest.UsageError("TEST_DATABASE_HOST doit désigner le serveur réservé aux tests.")

os.environ["DATABASE_URL"] = test_url
os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-long-enough-for-hs256"

from app.core.config import settings
from app.db import session as database


schema = os.getenv("TEST_DATABASE_SCHEMA", f"pytest_{uuid4().hex}")
if re.fullmatch(r"pytest_[0-9a-f]{32}", schema) is None:
    raise pytest.UsageError("Le schéma de test doit avoir un nom temporaire valide.")
database.engine = create_async_engine(
    settings.database_url,
    poolclass=NullPool,
    execution_options={"schema_translate_map": {None: schema}},
)
database.session_factory = async_sessionmaker(
    database.engine,
    expire_on_commit=False,
)


async def manage_schema(create: bool) -> None:
    admin = create_async_engine(settings.database_url, poolclass=NullPool)
    try:
        async with admin.begin() as connection:
            if create:
                await connection.execute(CreateSchema(schema))
            else:
                await connection.execute(DropSchema(schema, cascade=True, if_exists=True))
    finally:
        await admin.dispose()


@pytest.fixture(autouse=True)
def isolated_database() -> Generator[None, None, None]:
    asyncio.run(manage_schema(True))
    try:
        yield
    finally:
        asyncio.run(manage_schema(False))
