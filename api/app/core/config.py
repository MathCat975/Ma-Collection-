from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    database_url: str = "sqlite+aiosqlite:///./ma_collection.db"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
