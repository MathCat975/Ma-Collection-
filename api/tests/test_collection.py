import asyncio
import os

import pytest


test_database_url = os.getenv("TEST_DATABASE_URL")

if test_database_url is None:
    pytest.skip(
        "TEST_DATABASE_URL est requis pour les tests PostgreSQL",
        allow_module_level=True,
    )

os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-long-enough-for-hs256"
os.environ["DATABASE_URL"] = test_database_url

from fastapi.testclient import TestClient

from app.db.session import session_factory
from app.main import app
from app.models.item import Item


async def create_item() -> int:
    async with session_factory() as session:
        item = Item(
            titre="Celeste",
            categorie="Plateforme",
            description="Une ascension exigeante.",
            image_url="https://example.test/celeste.jpg",
            annee=2018,
            studio="Maddy Makes Games",
            plateforme="PC",
        )
        session.add(item)
        await session.commit()
        await session.refresh(item)
        return item.id


def register_and_login(
    client: TestClient,
    email: str,
) -> dict[str, str]:
    client.post(
        "/auth/register",
        json={"email": email, "password": "motdepassefort"},
    )
    response = client.post(
        "/auth/login",
        json={"email": email, "password": "motdepassefort"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_personal_collection_lifecycle_and_ownership() -> None:
    with TestClient(app) as client:
        item_id = asyncio.run(create_item())
        owner_headers = register_and_login(client, "owner@example.com")
        other_headers = register_and_login(client, "other@example.com")

        created = client.post(
            "/me/collection",
            headers=owner_headers,
            json={
                "item_id": item_id,
                "statut": "a_decouvrir",
                "note": 4,
                "commentaire": "A commencer",
            },
        )
        duplicate = client.post(
            "/me/collection",
            headers=owner_headers,
            json={
                "item_id": item_id,
                "statut": "en_cours",
            },
        )
        entry_id = created.json()["id"]
        updated = client.patch(
            f"/me/collection/{entry_id}",
            headers=owner_headers,
            json={
                "statut": "termine",
                "note": 5,
                "commentaire": "Excellent",
            },
        )
        filtered = client.get(
            "/me/collection?statut=termine&tri=note",
            headers=owner_headers,
        )
        other_list = client.get(
            "/me/collection",
            headers=other_headers,
        )
        forbidden_update = client.patch(
            f"/me/collection/{entry_id}",
            headers=other_headers,
            json={"note": 1},
        )
        forbidden_delete = client.delete(
            f"/me/collection/{entry_id}",
            headers=other_headers,
        )
        deleted = client.delete(
            f"/me/collection/{entry_id}",
            headers=owner_headers,
        )

    assert created.status_code == 201
    assert created.json()["item"]["titre"] == "Celeste"
    assert created.json()["date_ajout"]
    assert duplicate.status_code == 409
    assert updated.status_code == 200
    assert updated.json()["statut"] == "termine"
    assert updated.json()["note"] == 5
    assert len(filtered.json()) == 1
    assert other_list.json() == []
    assert forbidden_update.status_code == 404
    assert forbidden_delete.status_code == 404
    assert deleted.status_code == 204
