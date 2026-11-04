# Upstream sync report

Personal repository: `Soumen2581/Capstone-Project` (`origin`)  
Professor / team repository: `htmw/F2026-T2-Phoenix` (`course` remote — **read only**)

Date: 2026-11-03  
Branch: `sprint-2-implementation`

## Remotes

| Remote | URL | Policy |
|--------|-----|--------|
| origin | https://github.com/Soumen2581/Capstone-Project.git | Only write target |
| course | https://github.com/htmw/F2026-T2-Phoenix.git | Fetch / compare only |

Note: the prompt asked for an `upstream` remote name; this clone uses `course` for the same repository. Behaviour is unchanged: never push to it.

## Comparison summary

Shallow compare of backend/frontend trees (2026-11-03):

- Personal repo already contains the Sprint 2 orchestration stack (DAG engine, retries, workflows, Google auth).
- Course repo adds Render deploy helpers (`render.yaml`, `backend/start.sh`, `docs/operations/render.md`) and Dockerfile/config tweaks for hosted deploy.
- No bulk merge was performed: histories diverged after Sprint 1 and a blind merge would risk overwriting personal work.

## Integrated into personal Sprint 2 work

- None of the Render-only files were copied in this pass (deploy is Sprint 3–adjacent; keep local Docker Compose as the default).

## Useful upstream items not yet ported

| Item | Why deferred |
|------|----------------|
| `render.yaml` / `start.sh` | Hosted deploy; document in Sprint 3 readiness |
| Course wiki formatting | Wiki lives on GitHub wiki; personal wiki remains on personal repo |

## Conflicts / decisions

- Prefer personal agent registry + planner semantics over any course rename that would break tests.
- Prefer personal Google auth + operator header demo path over inventing password auth without secrets infrastructure.

## Remaining sync work

1. Optionally port Render blueprint after Sprint 2 acceptance.
2. When uploading Sprint 2 evidence to the course repo, rewrite wiki links to `htmw/F2026-T2-Phoenix` (same process as Sprint 1).
