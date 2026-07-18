# Architecture Decision Records

Each ADR captures *why* a choice was made, the alternatives considered, and
the consequences. ADRs are append-only: when a decision is reversed, add a
new ADR that supersedes the old one and link back.

| # | Decision | Status | Date |
| --- | --- | --- | --- |
| 0001 | Cloudflare Pages + Functions over Vercel | Accepted | 2026-03 |
| 0002 | Turso (libSQL) for the database | Accepted | 2026-03 |
| 0003 | Google One Tap + JWT cookie (no OAuth redirect) | Accepted | 2026-03 |
| 0004 | FSRS spaced repetition for concept mastery | Accepted | 2026-04 |
| 0005 | Socratic AI never gives direct solutions | Accepted | 2026-04 |
| 0006 | In-process Vite dev AI bridge (replace local-ai submodule) | Accepted | 2026-06 |
| 0007 | Unified learning-sources registry (reference-only) | Accepted | 2026-07 |
| 0008 | Embedded GitHub learning library | Accepted | 2026-02 |

## Format

```
# ADR NNNN: Title

Date: YYYY-MM
Status: Accepted | Superseded by NNNN | Deprecated

## Context
## Decision
## Alternatives considered
## Consequences
```
