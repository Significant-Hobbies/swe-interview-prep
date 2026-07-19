# swe-interview-prep — Documentation

This directory is the canonical, source-of-truth documentation for the
` swe-interview-prep ` repository. Markdown here is authoritative; the
[Blume](https://useblume.dev) config at the repo root is only a presentation
and search layer over these same files.

Agent-facing rules live in [`AGENTS.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/AGENTS.md). Current state lives
in [`STATUS.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/STATUS.md).

## What lives where

| Path | Contents |
| --- | --- |
| [`product/overview.md`](product/overview.md) | What the product is, its surfaces, and competitive context |
| [`architecture/overview.md`](architecture/overview.md) | System architecture, request/data flow, and decision records (ADRs) |
| [`architecture/decisions/README.md`](architecture/decisions/README.md) | Architecture Decision Records — why a choice was made |
| [`development/commands.md`](development/commands.md) | Local setup, commands, environment, testing, content pipelines |
| [`operations/ci.md`](operations/ci.md) | Deploy, CI, scheduled jobs, and runbooks |
| [`operations/jobs/weekly-quality.md`](operations/jobs/weekly-quality.md) | Scheduled GitHub Actions jobs and their contracts |
| [`operations/runbooks/reader-adapter.md`](operations/runbooks/reader-adapter.md) | Operational procedures (secret rotation, adapter activation) |
| [`knowledge/failed-approaches.md`](knowledge/failed-approaches.md) | Durable learnings and reusable failed approaches |
| [`learning/index.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/learning/index.md) | In-product learning roadmaps. **Product content** — loaded by the app at build time via Vite glob; do not move or rename |
| [`archive/`](https://github.com/Significant-Hobbies/swe-interview-prep/tree/main/docs/archive) | Historical snapshots kept for git history and reference; not authoritative |

## How to read this

- **New to the repo?** [`product/overview.md`](product/overview.md) → [`architecture/overview.md`](architecture/overview.md) → [`development/setup.md`](development/setup.md).
- **On-call / deploying?** [`operations/deploy.md`](operations/deploy.md) + the [runbooks](operations/runbooks/reader-adapter.md).
- **Wondering why something is the way it is?** [`architecture/decisions/README.md`](architecture/decisions/README.md) lists every recorded decision.
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
5. Stale docs go to the [archive](https://github.com/Significant-Hobbies/swe-interview-prep/tree/main/docs/archive) (preserving git rename history), not
   the trash. Never delete useful history.
6. Every page states its scope up front. If a page would be empty, do not
   create it.
