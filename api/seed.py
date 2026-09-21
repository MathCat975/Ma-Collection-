import asyncio
import json
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db.init_db import create_db_and_tables
from app.db.session import engine, session_factory
from app.models.item import Item

GAMES = json.loads(
    Path(__file__).with_name("seed_games.json").read_text(encoding="utf-8")
)
ALIASES = {
    "God of War (2018)": "God of War",
    "Civilization VI": "Sid Meier's Civilization VI",
    "Skyrim": "The Elder Scrolls V: Skyrim",
}


async def populate(session: AsyncSession) -> int:
    existing = {item.titre: item for item in (await session.scalars(select(Item))).all()}
    added = 0
    for data in GAMES:
        item = existing.get(data["titre"]) or existing.get(ALIASES.get(data["titre"]))
        if item is None:
            item = Item(**data)
            added += 1
        else:
            for field, value in data.items():
                setattr(item, field, value)
        session.add(item)
        existing[data["titre"]] = item
    await session.commit()
    return added


async def seed() -> None:
    try:
        await create_db_and_tables()
        async with session_factory() as session:
            added = await populate(session)
        print(f"{added} jeux ajoutes ; {len(GAMES)} jeux synchronises")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
