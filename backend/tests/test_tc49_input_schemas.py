"""TC_49 — built-in agents must expose meaningful input and output schemas."""

from __future__ import annotations

import uuid

import pytest
from httpx import AsyncClient

from app.agents.builtin import BUILTIN_AGENTS
from app.domain.enums import ErrorKind
from app.schemas.execution import AgentInput
from app.services.agent_executor import AgentExecutor, _input_document
from app.services.output_validation import validate_agent_input


@pytest.mark.asyncio
async def test_every_builtin_agent_schema_endpoint_returns_both_contracts(
    db_client: AsyncClient,
) -> None:
    for agent in BUILTIN_AGENTS:
        response = await db_client.get(f"/api/v1/agents/{agent.id}/schema")
        assert response.status_code == 200, agent.id
        body = response.json()
        assert body["agent_id"] == agent.id
        assert body["input_schema"].get("type") == "object", agent.id
        assert "objective" in body["input_schema"].get("properties", {}), agent.id
        assert (
            body["input_schema"].get("properties", {}).get("objective", {}).get("type") == "string"
        )
        assert body["output_schema"].get("type") == "object", agent.id
        assert body["output_schema"].get("properties"), agent.id


def test_every_builtin_declares_a_non_empty_input_schema() -> None:
    assert len(BUILTIN_AGENTS) == 10
    for agent in BUILTIN_AGENTS:
        schema = agent.input_schema
        assert schema.get("type") == "object", agent.id
        props = schema.get("properties") or {}
        assert isinstance(props, dict)
        assert "objective" in props, agent.id
        assert "parameters" in props, agent.id
        assert "upstream" in props, agent.id
        required = schema.get("required")
        assert isinstance(required, list) and "objective" in required, agent.id


def test_valid_minimal_input_passes_for_every_builtin() -> None:
    document: dict[str, object] = {
        "objective": "Do the work",
        "parameters": {},
        "upstream": [],
        "feedback": None,
        "context_notes": None,
    }
    for agent in BUILTIN_AGENTS:
        outcome = validate_agent_input(document, agent.input_schema)
        assert outcome.valid, f"{agent.id}: {outcome.error}"


def test_empty_objective_is_rejected_for_every_builtin() -> None:
    document: dict[str, object] = {
        "objective": "",
        "parameters": {},
        "upstream": [],
        "feedback": None,
        "context_notes": None,
    }
    for agent in BUILTIN_AGENTS:
        outcome = validate_agent_input(document, agent.input_schema)
        assert not outcome.valid, agent.id
        assert outcome.fields, agent.id


def test_malformed_upstream_item_is_rejected() -> None:
    agent = next(a for a in BUILTIN_AGENTS if a.id == "coding-agent")
    document: dict[str, object] = {
        "objective": "Fix the bug",
        "parameters": {},
        "upstream": [{"node_key": "n1"}],  # missing agent_id + payload
        "feedback": None,
        "context_notes": None,
    }
    outcome = validate_agent_input(document, agent.input_schema)
    assert not outcome.valid
    assert outcome.error


@pytest.mark.asyncio
async def test_executor_rejects_invalid_input_without_calling_provider(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    agent = next(a for a in BUILTIN_AGENTS if a.id == "general-agent")
    executor = AgentExecutor(providers=None)  # type: ignore[arg-type]

    called = {"rank": False}

    def _boom(*_args: object, **_kwargs: object) -> None:
        called["rank"] = True
        raise AssertionError("provider ranking must not run for invalid input")

    monkeypatch.setattr(executor, "_providers", type("P", (), {"rank_models": _boom})())

    result = await executor.execute(
        agent,
        AgentInput(
            task_id=uuid.uuid4(),
            node_key="general",
            agent_id=agent.id,
            objective="",  # invalid
        ),
    )
    assert not result.succeeded
    assert result.error is not None
    assert result.error.kind is ErrorKind.INVALID_REQUEST
    assert called["rank"] is False


def test_input_document_projection_matches_schema_shape() -> None:
    agent_input = AgentInput(
        task_id=uuid.uuid4(),
        node_key="n1",
        agent_id="coding-agent",
        objective="Implement feature",
        parameters={"language": "python"},
    )
    document = _input_document(agent_input)
    assert set(document) == {
        "objective",
        "parameters",
        "upstream",
        "feedback",
        "context_notes",
    }
    coding = next(a for a in BUILTIN_AGENTS if a.id == "coding-agent")
    assert validate_agent_input(document, coding.input_schema).valid
