"""Email/password registration persists users and issues sessions."""

from __future__ import annotations

from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.agents.builtin import BUILTIN_AGENTS
from app.agents.seed import seed_agents
from app.api.dependencies import get_session
from app.core.config import Settings
from app.core.passwords import hash_password, verify_password
from app.main import create_app
from app.providers.fake import FakeProvider
from app.providers.registry import ProviderRegistry


def test_password_hash_round_trip() -> None:
    stored = hash_password("correct-horse-battery")
    assert stored.startswith("pbkdf2_sha256$")
    assert verify_password("correct-horse-battery", stored)
    assert not verify_password("wrong-password", stored)


@pytest.fixture
def password_auth_settings(settings: Settings) -> Settings:
    return settings.model_copy(
        update={
            "auth_mode": "header",
            "jwt_secret": SecretStr("password-auth-test-jwt-secret"),
        }
    )


@pytest.fixture
async def password_auth_client(
    password_auth_settings: Settings,
    session_factory: async_sessionmaker[AsyncSession],
    fake_provider: FakeProvider,
) -> AsyncIterator[AsyncClient]:
    app = create_app(password_auth_settings)
    app.state.session_factory = session_factory
    app.state.provider_registry = ProviderRegistry([fake_provider])

    async with session_factory() as session:
        await seed_agents(session, BUILTIN_AGENTS)
        await session.commit()

    async def override_session() -> AsyncIterator[AsyncSession]:
        async with session_factory() as request_session:
            yield request_session
            await request_session.commit()

    app.dependency_overrides[get_session] = override_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


async def test_register_persists_user_and_login_works(password_auth_client: AsyncClient) -> None:
    register = await password_auth_client.post(
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

    me = await password_auth_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {body['session_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "new.user@example.com"

    duplicate = await password_auth_client.post(
        "/api/v1/auth/register",
        json={"email": "new.user@example.com", "password": "securepass1"},
    )
    assert duplicate.status_code == 409

    bad = await password_auth_client.post(
        "/api/v1/auth/login",
        json={"email": "new.user@example.com", "password": "wrong-password"},
    )
    assert bad.status_code == 401

    ok = await password_auth_client.post(
        "/api/v1/auth/login",
        json={"email": "New.User@Example.com", "password": "securepass1"},
    )
    assert ok.status_code == 200, ok.text
    assert ok.json()["user"]["id"] == body["user"]["id"]
    assert ok.json()["session_token"]


async def test_register_rejects_short_password(password_auth_client: AsyncClient) -> None:
    response = await password_auth_client.post(
        "/api/v1/auth/register",
        json={"email": "short@example.com", "password": "tiny"},
    )
    assert response.status_code == 422
