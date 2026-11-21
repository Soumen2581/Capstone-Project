# Sprint 3 status (personal repo)

Branch: `sprint-3-us09-us11` on [Soumen2581/Capstone-Project](https://github.com/Soumen2581/Capstone-Project).

Professor repo (`htmw/F2026-T2-Phoenix`) is **read-only** — not modified.

## Stories

| Story | Status | Notes |
|-------|--------|-------|
| TC_49 Input schemas | **Done in this branch** | All 10 built-ins declare meaningful `input_schema`; executor validates; schema API returns both contracts. |
| US_09 Model routing | **Extended** | Existing adapters (OpenAI-compatible incl. Gemini, Anthropic, Fake) + trait router + fallback. Persists `routing_reason`, alternatives, and fallback origin. When another model remains, hung primaries hand off within `FALLBACK_HANDOFF_SECONDS` (5s); covered by unit tests. |
| US_10 Cost transparency | **Extended** | Existing per-attempt tokens/cost/latency. Work tab now shows a cost summary table with totals and fallback rows. |
| US_11 Result synthesis | **Extended** | Existing `synthesise()` + chat thread. UI now surfaces contributor attribution and cost on the result bubble. |

## React Bits

- Integrated official `FadeContent` (TS + Tailwind variant source from [react-bits](https://github.com/DavidHDev/react-bits)) under `frontend/components/react-bits/FadeContent.tsx`.
- Dependency: `gsap` (required by FadeContent).
- Applied on workflow result reveal; respects `prefers-reduced-motion` via CSS.

## Migration

- `u13_execution_routing` adds routing/fallback columns on `executions`.

## Not claimed complete without local Docker verification

Docker was unavailable during this session, so full compose + Playwright e2e was not executed here. Backend unit tests for TC_49 / fallback were run where Postgres was not required.
