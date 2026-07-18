# STATUS — swe-interview-prep

Last updated: 2026-07-18

A short view of the current objective, active work, blockers, and next steps.
Detailed history and feature inventory live in
[`docs/knowledge/learnings.md`](docs/knowledge/learnings.md) and
[`docs/product/overview.md`](docs/product/overview.md). The fleet-format
project record is mirrored in [`PROJECT_STATUS.md`](PROJECT_STATUS.md).

## Current objective

**Maintenance-only.** Per the 2026-07-10 personal-use closure: keep SWE
Interview Prep available for direct use. Accept only maintenance,
reliability, or personally requested workflow fixes. No roadmap expansion,
no new backend providers, no alternate auth modes, no paid tiers, no team
workspaces.

## Active work

- **Repository knowledge consolidation** (this change) — unified the
  scattered `docs/` tree into a canonical structure, added ADRs, runbooks,
  STATUS, Blume config, and docs-validation CI. Branch
  `docs/consolidate-knowledge-system`, staged for human review.

## Blockers / known gaps

- **`READER_API_TOKEN` not configured.** The private Reader adapter is
  built and tested but not activated in production. Activating it is a
  planned item — see
  [`docs/operations/runbooks/reader-adapter.md`](docs/operations/runbooks/reader-adapter.md).
- **End-to-end CI against live Turso + Cloudflare bindings is
  operator-dependent**, not fully automated in repo. The deploy workflow
  smokes the SPA + `/api/learning` after deploy but does not exercise the
  full DB-backed flow in CI.
- **JWT_SECRET rotation not yet performed.** The 2026-03-29 audit removed
  the hardcoded fallback; commit `26c3eb4` exposed the old secret in git
  history. Rotation is a known low-severity follow-up — see
  [`docs/operations/runbooks/rotate-jwt-secret.md`](docs/operations/runbooks/rotate-jwt-secret.md).
- **Some historical README/migration references** to the pre-Pages
  architecture remain in archived docs. They are explicitly marked stale
  and live under [`docs/archive/`](docs/archive/) — do not guide new work
  from them.

## Unresolved questions

- None open. (Personal-use closure resolved the roadmap-expansion question.)

## Next steps

1. Human review + merge of the `docs/consolidate-knowledge-system` branch.
2. Optional: install Blume locally (`pnpm add -D blume`) and run
   `pnpm docs:build` to preview the rendered docs site before publishing.
3. Optional: activate the Reader adapter by configuring `READER_API_TOKEN`
   (runbook linked above).
4. Optional: rotate `JWT_SECRET` (runbook linked above).

## Deferred (do not pursue unless personally requested)

- Vercel/serverless migration — stale; do not guide new work.
- Broad ATS, job boards, or application-tracking features.
- New backend providers or alternate auth modes.
- Paid tiers or team workspaces.
- Regression-test expansion beyond existing focused coverage.
