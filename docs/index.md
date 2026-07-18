# swe-interview-prep — Documentation

This directory is the canonical, source-of-truth documentation for the
` swe-interview-prep ` repository. Markdown here is authoritative; the
[Blume](https://useblume.dev) config at the repo root is only a presentation
and search layer over these same files.

Agent-facing rules live in [`../AGENTS.md`](../AGENTS.md). Current state lives
in [`../STATUS.md`](../STATUS.md).

## What lives where

| Path | Contents |
| --- | --- |
| [`product/`](product/) | What the product is, its surfaces, and competitive context |
| [`architecture/`](architecture/) | System architecture, request/data flow, and decision records (ADRs) |
| [`architecture/decisions/`](architecture/decisions/) | Architecture Decision Records — why a choice was made |
| [`development/`](development/) | Local setup, commands, environment, testing, content pipelines |
| [`operations/`](operations/) | Deploy, CI, scheduled jobs, and runbooks |
| [`operations/jobs/`](operations/jobs/) | Scheduled GitHub Actions jobs and their contracts |
| [`operations/runbooks/`](operations/runbooks/) | Operational procedures (secret rotation, adapter activation) |
| [`knowledge/`](knowledge/) | Durable learnings and reusable failed approaches |
| [`learning/`](learning/) | In-product learning roadmaps. **Product content** — loaded by the app at build time via Vite glob; do not move or rename |
| [`archive/`](archive/) | Historical snapshots (migrations, past audits, old plans, research). Kept for git history and reference; not authoritative |

## How to read this

- **New to the repo?** [`product/overview.md`](product/overview.md) → [`architecture/overview.md`](architecture/overview.md) → [`development/setup.md`](development/setup.md).
- **On-call / deploying?** [`operations/deploy.md`](operations/deploy.md) + the runbooks under [`operations/runbooks/`](operations/runbooks/).
- **Wondering why something is the way it is?** [`architecture/decisions/`](architecture/decisions/) lists every recorded decision.
- **Hitting a known pitfall?** [`knowledge/failed-approaches.md`](knowledge/failed-approaches.md).

## Maintenance rules

1. Markdown in this tree is the source of truth. If a fact is here, it must not
   also live in the README, AGENTS.md, or inline code comments as the canonical
   copy — link instead.
2. Code and executable configuration (CI workflows, `package.json` scripts,
   `wrangler.toml`, `vite.config.js`) remain authoritative for implementation
   details and schedules. Docs describe *why* and *how to operate*; code
   describes *what runs*.
3. Do not duplicate facts that are easily discoverable from code. A doc should
   explain non-obvious constraints, operational procedures, decisions, and
   reusable failures — not restate the file tree.
4. When a decision is reversed, add a new ADR that supersedes the old one; do
   not silently edit the old ADR.
5. Stale docs go to [`archive/`](archive/) (preserving git rename history), not
   the trash. Never delete useful history.
6. Every page states its scope up front. If a page would be empty, do not
   create it.
