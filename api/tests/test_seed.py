from fastapi.testclient import TestClient
from sqlmodel import select
from app.main import app
from app.db.session import session_factory
from app.models.item import Item
from seed import GAMES, populate

async def check_seed() -> None:
    async with session_factory() as session:
        await populate(session)
        first = {item.titre: item.id for item in (await session.scalars(select(Item))).all()}
        assert await populate(session) == 0
        second = {item.titre: item.id for item in (await session.scalars(select(Item))).all()}
        assert first == second
        assert all(game["titre"] in second for game in GAMES)
        assert len(GAMES) == 59
        assert len({game["categorie"] for game in GAMES}) >= 4
        item = await session.get(Item, second[GAMES[0]["titre"]])
        item.description = "outdated"
        await session.commit()
        await populate(session)
        await session.refresh(item)
        assert item.description == GAMES[0]["description"]

def test_seed_updates_without_duplicates() -> None:
    with TestClient(app) as client:
        client.portal.call(check_seed)

def test_cors_and_errors() -> None:
    with TestClient(app) as client:
        allowed = client.options("/items", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"})
        denied = client.options("/items", headers={"Origin": "http://example.com", "Access-Control-Request-Method": "GET"})
        assert allowed.headers["access-control-allow-origin"] == "http://localhost:5173"
        assert "access-control-allow-origin" not in denied.headers
        assert client.get("/me/stats").status_code == 401
        assert client.get("/items?q=x").json()["erreur"]["code"] == 422
