"""Persist model routing metadata on each execution attempt (US_09).

Revision ID: u13_execution_routing
Revises: u12_agent_enrollment
Create Date: 2026-11-21
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "u13_execution_routing"
down_revision: str | None = "u12_agent_enrollment"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("executions", sa.Column("routing_reason", sa.Text(), nullable=True))
    op.add_column(
        "executions",
        sa.Column(
            "routing_alternatives",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )
    op.add_column(
        "executions",
        sa.Column("fallback_from_provider", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "executions",
        sa.Column("fallback_from_model", sa.String(length=128), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("executions", "fallback_from_model")
    op.drop_column("executions", "fallback_from_provider")
    op.drop_column("executions", "routing_alternatives")
    op.drop_column("executions", "routing_reason")
