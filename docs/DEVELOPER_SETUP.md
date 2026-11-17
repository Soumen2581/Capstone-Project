# Developer Setup Guide

## Supported path (recommended)

```bash
git clone https://github.com/Soumen2581/Capstone-Project.git
cd Capstone-Project
cp .env.example .env
docker compose up --build
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend |
| http://localhost:3000/office | Operator office |
| http://localhost:8000/docs | OpenAPI (non-production) |
| http://localhost:8000/healthz | Liveness |
| http://localhost:8000/readyz | Readiness (Postgres + Redis) |

## Quality gates

```bash
make install   # local venv + npm ci (optional if using containers only)
make check     # lint + typecheck + pytest (host)
make e2e-ci    # Demo Mode compose + Playwright
```

**Note:** On some host Python versions (observed: 3.14 local venv), host-side `asyncpg` connections to localhost Postgres can hang. Prefer:

```bash
docker compose exec -e TEST_DATABASE_URL=postgresql+asyncpg://agentorch:change-me-locally@postgres:5432/agentorch_test \
  backend pytest -q --no-cov
```

(adjust password to match your `.env` / `.env.example`.)

## Branches

- `master` — releasable line used by this personal repo
- `develop` — integration branch (created for CS 691 MAIN/DEVELOP organization)

Do not push to the course remote `htmw/F2026-T2-Phoenix` from this finalization workflow.

## Technical paper

Not part of this repository’s authored content. Owner supplies separately — see [`MISSING_SUBMISSION_FILES.md`](../MISSING_SUBMISSION_FILES.md).
