import os
from uuid import uuid4

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

from app.main import app


def test_account_lifecycle() -> None:
    email = f"joueur-{uuid4()}@example.com"

    with TestClient(app) as client:
        created = client.post(
            "/auth/register",
            json={"email": email, "password": "motdepassefort"},
        )
        duplicate = client.post(
            "/auth/register",
            json={"email": email, "password": "motdepassefort"},
        )
        invalid_login = client.post(
            "/auth/login",
            json={"email": email, "password": "mauvaismotdepasse"},
        )
        login = client.post(
            "/auth/login",
            json={"email": email, "password": "motdepassefort"},
        )
        token = login.json()["access_token"]
        current_user = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        unauthenticated = client.get("/auth/me")

    assert created.status_code == 201
    assert isinstance(created.json()["id"], int)
    assert created.json()["email"] == email
    assert duplicate.status_code == 409
    assert duplicate.json()["erreur"]["code"] == 409
    assert invalid_login.status_code == 401
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"
    assert current_user.json() == created.json()
    assert unauthenticated.status_code == 401
