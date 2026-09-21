from datetime import datetime, timedelta, timezone

import jwt
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from tests.test_collection import create_item, register_and_login


def test_validation_and_protected_routes() -> None:
    with TestClient(app) as client:
        for path in (
            "/items?page=0",
            "/items?limit=51",
            "/items?q=x",
            "/items/not-a-number",
        ):
            response = client.get(path)
            assert response.status_code == 422
            assert set(response.json()) == {"erreur"}
        for method, path, body in (
            ("GET", "/auth/me", None),
            ("GET", "/me/stats", None),
            ("GET", "/me/collection", None),
            ("POST", "/me/collection", {"item_id": 1, "statut": "a_decouvrir"}),
            ("PATCH", "/me/collection/1", {"note": 4}),
            ("DELETE", "/me/collection/1", None),
        ):
            response = client.request(method, path, json=body)
            assert response.status_code == 401
            assert response.json()["erreur"]["code"] == 401
        assert client.get("/items").json()["results"] == []
        assert client.get("/missing-route").json()["erreur"]["code"] == 404
        response = client.post(
            "/auth/register",
            json={"email": "unicode@example.com", "password": "é" * 40},
        )
        assert response.status_code == 422


def test_expired_incomplete_and_invalid_tokens() -> None:
    with TestClient(app) as client:
        for payload in (
            {"sub": "1", "iat": datetime.now(timezone.utc)},
            {
                "sub": "1",
                "iat": datetime.now(timezone.utc) - timedelta(hours=2),
                "exp": datetime.now(timezone.utc) - timedelta(hours=1),
            },
        ):
            token = jwt.encode(
                payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
            )
            response = client.get(
                "/auth/me", headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 401
        assert client.get(
            "/auth/me", headers={"Authorization": "Bearer invalid"}
        ).status_code == 401


def test_collection_validation_sorting_and_nullable_fields() -> None:
    with TestClient(app) as client:
        auth = register_and_login(client, "contract@example.com")
        ids = [client.portal.call(create_item) for _ in range(3)]
        for body in (
            {"item_id": ids[0], "statut": "unknown"},
            {"item_id": ids[0], "statut": "a_decouvrir", "note": 0},
            {"item_id": ids[0], "statut": "a_decouvrir", "note": 6},
        ):
            assert client.post(
                "/me/collection", headers=auth, json=body
            ).status_code == 422
        assert client.post(
            "/me/collection",
            headers=auth,
            json={"item_id": 2147483647, "statut": "a_decouvrir"},
        ).status_code == 404
        entries = [
            client.post(
                "/me/collection",
                headers=auth,
                json={"item_id": item_id, "statut": "en_cours", "note": note},
            ).json()
            for item_id, note in zip(ids, [2, None, 5])
        ]
        ratings = client.get("/me/collection?tri=note", headers=auth).json()
        assert [entry["note"] for entry in ratings] == [5, 2, None]
        dates = client.get("/me/collection?tri=date", headers=auth).json()
        assert [entry["id"] for entry in dates] == [
            entry["id"] for entry in reversed(entries)
        ]
        stats = client.get("/me/stats", headers=auth).json()
        assert stats["note_moyenne"] == 3.5
        assert stats["par_statut"]["en_cours"] == 3
        path = f"/me/collection/{entries[0]['id']}"
        assert client.patch(
            path, headers=auth, json={"statut": None}
        ).status_code == 422
        cleared = client.patch(
            path, headers=auth, json={"note": None, "commentaire": None}
        ).json()
        assert cleared["note"] is None
        assert cleared["statut"] == "en_cours"
        assert client.get("/me/collection?tri=unknown", headers=auth).status_code == 422


def test_openapi_contract() -> None:
    schema = app.openapi()
    for path, operations in schema["paths"].items():
        for method, operation in operations.items():
            assert operation["summary"]
            responses = operation["responses"]
            assert responses["422"]["content"]["application/json"]["schema"]["$ref"].endswith(
                "/ErrorResponse"
            )
            if method != "delete":
                success = responses.get("200") or responses.get("201")
                assert success["content"]["application/json"]["schema"]
            if path.startswith("/me/"):
                assert operation["security"]
