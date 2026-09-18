from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


api_directory = Path(__file__).resolve().parents[2]
project_directory = api_directory.parent


class Settings(BaseSettings):
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    database_url: str

    model_config = SettingsConfigDict(
        env_file=(
            api_directory / ".env",
            project_directory / ".env.local",
        ),
        extra="ignore",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def use_asyncpg(cls, value: str) -> str:
        if value.startswith("postgresql://"):
            value = value.replace(
                "postgresql://",
                "postgresql+asyncpg://",
                1,
            )

        if value.startswith("postgres://"):
            value = value.replace(
                "postgres://",
                "postgresql+asyncpg://",
                1,
            )

        parts = urlsplit(value)
        query = dict(parse_qsl(parts.query))
        ssl_mode = query.pop("sslmode", None)
        query.pop("channel_binding", None)

        if ssl_mode is not None:
            query["ssl"] = ssl_mode

        return urlunsplit(
            (
                parts.scheme,
                parts.netloc,
                parts.path,
                urlencode(query),
                parts.fragment,
            ),
        )


settings = Settings()
