from sqlmodel import SQLModel

from app.db.session import engine
from app.models.item import Item
from app.models.user import User


async def create_db_and_tables() -> None:
    _ = Item, User

    async with engine.begin() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)
