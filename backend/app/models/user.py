"""Authenticated user accounts.

The durable identity key is ``google_sub`` (Google subject, or ``local:<uuid>`` for
email/password accounts). Email is unique and is never used to merge two subjects.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class UserRecord(Base, TimestampMixin):
    __tablename__ = "users"

    google_sub: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    display_name: Mapped[str | None] = mapped_column(String(240), nullable=True)
    picture_url: Mapped[str | None] = mapped_column(String(2_000), nullable=True)
    #: Null for Google-only accounts; set for email/password registration.
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    session_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
