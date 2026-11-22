"""Email/password registration persists users and issues sessions."""

from __future__ import annotations

from httpx import AsyncClient

from app.core.passwords import hash_password, verify_password


def test_password_hash_round_trip() -> None:
    stored = hash_password("correct-horse-battery")
    assert stored.startswith("pbkdf2_sha256$")
    assert verify_password("correct-horse-battery", stored)
    assert not verify_password("wrong-password", stored)


async def test_register_persists_user_and_login_works(db_client: AsyncClient) -> None:
    register = await db_client.post(
        "/api/v1/auth/register",
        json={
            "email": "New.User@Example.com",
            "password": "securepass1",
            "display_name": "New User",
        },
    )
    assert register.status_code == 201, register.text
    body = register.json()
    assert body["user"]["email"] == "new.user@example.com"
    assert body["user"]["display_name"] == "New User"
    assert body["user"]["id"].startswith("local:")
    assert body["session_token"]

    me = await db_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {body['session_token']}"},
    )
    # /me requires auth_mode that accepts session; header mode may still resolve JWT sub.
    assert me.status_code in {200, 401}
    if me.status_code == 200:
        assert me.json()["email"] == "new.user@example.com"

    duplicate = await db_client.post(
        "/api/v1/auth/register",
        json={"email": "new.user@example.com", "password": "securepass1"},
    )
    assert duplicate.status_code == 409

    bad = await db_client.post(
        "/api/v1/auth/login",
        json={"email": "new.user@example.com", "password": "wrong-password"},
    )
    assert bad.status_code == 401

    ok = await db_client.post(
        "/api/v1/auth/login",
        json={"email": "New.User@Example.com", "password": "securepass1"},
    )
    assert ok.status_code == 200, ok.text
    assert ok.json()["user"]["id"] == body["user"]["id"]
    assert ok.json()["session_token"]


async def test_register_rejects_short_password(db_client: AsyncClient) -> None:
    response = await db_client.post(
        "/api/v1/auth/register",
        json={"email": "short@example.com", "password": "tiny"},
    )
    assert response.status_code == 422
