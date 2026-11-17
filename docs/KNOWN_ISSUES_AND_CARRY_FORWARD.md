# Known Issues and Carry-Forward (through Sprint 2)

Last updated: 2026-11-16 (America/New_York)

## In scope but incomplete / fragile

| Item | Status | Notes |
|------|--------|-------|
| Workflow Builder e2e | PARTIAL | Playwright builder flows have been flaky historically; smoke specs cover office paths. Prefer Demo Mode compose for CI. |
| Google OAuth in local demos | PARTIAL | Requires `GOOGLE_CLIENT_ID` + `JWT_SECRET`; default Demo Mode uses header/JWT paths without Google. |
| Live paid provider runs in CI | intentionally skipped | CI supplies no provider keys; use Demo Mode / fakes. |
| Dedicated Sprint 2 planning/retro YouTube vs demo | PASS | Verified IDs: presentation `QPmhcV6kkbc`, demo `73D30fI-xio`, planning `xgsjFYFc9og`, retro `twiKLbI92vU`. |

## Explicitly out of scope for this finalization

- Sprint 3+ feature implementation (`docs/SPRINT_3_*` are planning only).
- CS 691 **technical paper** content (owner will provide).
- Rewriting Git history or pushing to the course remote.

## Branch workflow

- Personal remotes use `master` (primary) and `develop` (integration branch created for CS 691 organization).
- Prefer opening PRs into `develop`, then merging to `master` for releasable snapshots.
