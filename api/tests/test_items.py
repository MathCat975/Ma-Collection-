from fastapi.testclient import TestClient
from sqlmodel import delete

from app.db.session import session_factory
from app.main import app
from app.models.item import Item


async def seed_items() -> list[int]:
    async with session_factory() as session:
        await session.execute(delete(Item))
        items = [
            Item(
                titre="The Legend of Zelda",
                categorie="Aventure",
                description="Une aventure dans Hyrule.",
                image_url="https://example.test/zelda.jpg",
                annee=2017,
                studio="Nintendo",
                plateforme="Switch",
            ),
            Item(
                titre="Mario Kart 8 Deluxe",
                categorie="Course",
                description="Des courses multijoueur.",
                image_url="https://example.test/mario-kart.jpg",
                annee=2017,
                studio="Nintendo",
                plateforme="Switch",
            ),
            Item(
                titre="Zelda: Echoes of Wisdom",
                categorie="Aventure",
                description="Zelda explore Hyrule.",
                image_url="https://example.test/echoes.jpg",
                annee=2024,
                studio="Nintendo",
                plateforme="Switch",
            ),
        ]
        session.add_all(items)
        await session.commit()
        for item in items:
            await session.refresh(item)
        return [item.id for item in items]


def test_catalogue_search_filter_pagination_and_detail() -> None:
    with TestClient(app) as client:
        item_ids = client.portal.call(seed_items)

        all_items = client.get("/items")
        searched_items = client.get("/items?q=zelda")
        filtered_items = client.get("/items?categorie=aventure")
        paginated_items = client.get("/items?page=2&limit=1")
        item_detail = client.get(f"/items/{item_ids[0]}")
        missing_item = client.get("/items/2147483647")

    assert all_items.status_code == 200
    assert all_items.json()["total"] == 3
    assert searched_items.json()["total"] == 2
    assert filtered_items.json()["total"] == 2
    assert paginated_items.json()["results"][0]["titre"] == "Mario Kart 8 Deluxe"
    assert item_detail.json()["studio"] == "Nintendo"
    assert missing_item.status_code == 404
    assert missing_item.json()["erreur"]["code"] == 404
