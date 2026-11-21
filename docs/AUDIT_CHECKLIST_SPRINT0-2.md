# Sprint 0–2 Repository Audit Checklist

**Repository under change:** https://github.com/Soumen2581/Capstone-Project (personal)  
**Read-only reference:** https://github.com/htmw/F2026-T2-Phoenix  
**Audit date:** 2026-11-16 (America/New_York); docs refresh 2026-11-21  
**Scope:** Sprint 0–2 verified MVP. Sprint 3+ deliverable links are stubbed in wiki / `MISSING_SUBMISSION_FILES.md` for later upload.

## Git / remotes

| Issue | Location | Severity | Correction | Verification |
|-------|----------|----------|------------|--------------|
| Course remote must stay read-only | `git remote` (`course` → htmw/F2026-T2-Phoenix) | High | Never push/PR to course; all commits via `origin` | `git remote -v`; no course pushes |
| `develop` branch missing historically | Local/remote branches | Medium | Create `develop` from `master` on personal only | `git branch -a` shows `develop` |
| Working tree mostly clean; capture script untracked | `frontend/scripts/capture-sprint2-screens.mjs` | Low | Keep as optional helper or gitignore; do not treat as core product | `git status` |
| `.env` present locally, not tracked | `.env` / `.gitignore` | Pass | Keep ignored; CI secret job fails if tracked | `git ls-files .env` empty |

## Repository organization

| Issue | Location | Severity | Correction | Verification |
|-------|----------|----------|------------|--------------|
| Sprint 2 slides/demo/Excel not all in personal tree | `docs/sprints/`, `docs/agile/` | High | Copy verified Sprint 2 artifacts into personal repo | Files exist under `docs/` |
| Wiki Home lacked Sprint 2 deliverable section | `docs/wiki/Home.md` | High | Add Sprint 2 presentation/demo/planning/retro/stories/tests | Links resolve on personal |
| Mixed personal vs course wiki URLs | `docs/wiki/Home.md` | Medium | Prefer personal raw/blob for personal submission; keep course only as historical Sprint 0 where files live there | Spot-check links |
| No inventing tech paper | Submission docs | High | Do **not** author CS 691 technical paper; track as missing until owner uploads | See `MISSING_SUBMISSION_FILES.md` |

## Sprint 0 foundation

| Issue | Location | Severity | Correction | Verification |
|-------|----------|----------|------------|--------------|
| Stack present (FastAPI, Next.js, Postgres, Redis, Compose) | root, `backend/`, `frontend/` | Pass | Preserve | `docker compose ps`; `/healthz`, `/readyz` |
| ADRs + architecture docs exist | `docs/adr/`, `docs/architecture.md` | Pass | Keep accurate | Manual read |
| Seed agents / capability registry | `backend/app/agents/` | Pass | Preserve | `GET /api/v1/agents` |

## Sprint 1 features

| Feature / story area | Location | Status | Notes |
|----------------------|----------|--------|-------|
| Enrollment / auth paths | `backend/app/api`, JWT/Google | PARTIAL→verify | Google optional; `AUTH_MODE` |
| Multi-agent spawning / planning | `orchestration/`, `POST /api/v1/tasks` | PASS (code + tests) | Plan + execute DAG |
| Dynamic tables / schemas | agent schema endpoints | PASS (API present) | `GET .../schema` |
| Schema validation | `test_schemas.py`, output validation | PASS | pytest |
| Workflow tests | `backend/tests/`, `docs/agile/workflow-test-matrix.md` | PASS | CI pytest |
| Frontend office | `frontend/app/office` | PASS (running stack) | localhost:3000/office |

## Sprint 2 features

| Feature | Location | Status | Notes |
|---------|----------|--------|-------|
| DAG workflow execution | `workflows/engine.py` | PASS (tests) | Engine + API |
| Task dependencies | planner + engine | PASS | dependency tests |
| Cycle detection / repair bounds | planner rank; `max_repair_cycles` | PASS | documented in code |
| Agent handoff / messaging | message bus, hive | PASS (tests) | mail lifecycle guarded |
| Retry / failure handling | `RetryPolicy`, retry endpoints | PASS | `test_retry_and_recovery.py` |
| Postgres persistence | models + alembic | PASS | migrations in CI |
| Workflow builder UI | `WorkflowBuilder.tsx`, Build tab | PARTIAL | e2e historically flaky — verify Playwright |
| Live dashboard / Work tab | office page | PASS (API + UI present) | status from backend |
| Data Analyst capability | `data-analyst-agent`, `DATA_ANALYSIS` | PASS | builtin registry |
| CI/CD | `.github/workflows/ci.yml` | PASS (structure) | backend, frontend, docker, secrets, e2e |

## Security

| Issue | Severity | Correction | Verification |
|-------|----------|------------|--------------|
| No committed `.env` / keys | Pass | Maintain `.gitignore` + gitleaks job | CI secrets job |
| Provider keys backend-only | Pass | Document in README | Code review of frontend env |

## Documentation / submission

| Issue | Severity | Correction |
|-------|----------|------------|
| README still “Sprint 0 complete” framing | High | Rewrite for Sprint 0–2 verified MVP |
| Missing submission file tracker | High | `MISSING_SUBMISSION_FILES.md` |
| Technical paper | — | **Owner will supply; do not invent** |
| Installation/deployment consolidation | Medium | Point README at Makefile + Compose; keep `docs/operations/production.md` |

## Carry-forward (not implemented in this audit)

- Sprint 3+ roadmap docs exist (`docs/SPRINT_3_*`) — leave as planning only.
- Full live-provider e2e without Demo Mode — requires real API keys (not for CI).
- Course GitHub wiki sync — separate from personal repo; course is read-only for this work.
