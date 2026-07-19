# agents.md — swe-interview-prep

Agent bootloader. Read this first, then follow the links for depth.

## Shared Fleet Standard

Also read and follow the shared fleet-level agent standard at `../AGENTS.md`.
Treat this repository as owned product code: protect production stability,
keep changes scoped, verify work, and record durable follow-up tasks when
something remains incomplete or blocked.

## Purpose

Personal SWE Learning OS — a command center with six primary tabs (Today,
Learn, Practice, Mock, Playground, Progress) plus Docs, driving Concept →
Drill → Build → Review → Apply across nine tracks. FSRS spaced repetition
tracks concept mastery; the Playground (Monaco + Excalidraw + Socratic AI +
Feynman Gate) is the build/drill workspace. **Maintenance-only since
2026-07-10** — see [`STATUS.md`](STATUS.md).

Full product context: [`docs/product/overview.md`](docs/product/overview.md).

## Stack (one line)

React 19 SPA (Vite 8, React Router v7, Tailwind v4) + Cloudflare Pages
Functions (`functions/api/[[path]].js`) + Turso (libSQL) + Google One Tap
JWT + `ts-fsrs` spaced repetition. pnpm. TypeScript (strict: true).

Full architecture: [`docs/architecture/overview.md`](docs/architecture/overview.md).

## Key commands

```bash
pnpm dev            # Vite :5173 — AI bridge runs in-process (no separate server)
pnpm build          # validate env + vite build → dist/
pnpm test           # vitest run
pnpm test:e2e       # playwright test
pnpm lint           # biome check .
pnpm typecheck      # tsc --noEmit
pnpm ready          # env + tests + build + secret audit (pre-deploy gate)
pnpm docs:validate  # validate the docs/ tree (no install required)
```

Full command reference: [`docs/development/commands.md`](docs/development/commands.md).

## Critical constraints (do not violate)

- **Socratic AI never gives direct solutions.** `CompanionPanel.tsx` and the
  `/api/chat` system prompt only probe understanding. This is intentional —
  see [ADR 0005](docs/architecture/decisions/0005-socratic-no-solutions.md).
- **`docs/learning/*.md` is product content.** `src/pages/LearningDoc.tsx`
  Vite-globs it at build time and serves it at `/learning/:slug`. Do not
  move, rename, or delete those files — in-app routes depend on the slugs.
- **DB schema changes are additive only.** No migration runner; `initDatabase()`
  runs `CREATE TABLE IF NOT EXISTS` on first cold start. Source of truth:
  `shared/db/schema.mjs`, mirrored by hand in `functions/api/[[path]].js`.
- **Never commit secrets.** `.env.local` is gitignored (`*.local`). The
  Husky `pre-push` hook scans tracked files for common secret patterns.
- **Generated content under `src/data/library/` is not hand-edited.** Change
  `scripts/library.config.json` and re-run `pnpm fetch-library`.
- **`JWT_SECRET` has no fallback.** The audit removed
  `dev-secret-change-in-production`. Rotation runbook:
  [`docs/operations/runbooks/rotate-jwt-secret.md`](docs/operations/runbooks/rotate-jwt-secret.md).
- **Do not push, deploy, or open PRs without explicit user instruction.**
  Make changes locally and leave them for human review.

## Documentation navigation

The canonical documentation tree is [`docs/`](docs/). Start at
[`docs/index.md`](docs/index.md).

| Need | Read |
| --- | --- |
| What the product is | [`docs/product/overview.md`](docs/product/overview.md) |
| Routes + API surface | [`docs/product/surfaces.md`](docs/product/surfaces.md) |
| How it's built | [`docs/architecture/overview.md`](docs/architecture/overview.md) |
| Request / data flow | [`docs/architecture/data-flow.md`](docs/architecture/data-flow.md) |
| Why a choice was made | [`docs/architecture/decisions/`](docs/architecture/decisions/) |
| Local setup | [`docs/development/setup.md`](docs/development/setup.md) |
| Env vars | [`docs/development/env.md`](docs/development/env.md) |
| Content pipelines | [`docs/development/content-pipelines.md`](docs/development/content-pipelines.md) |
| Deploy | [`docs/operations/deploy.md`](docs/operations/deploy.md) |
| CI + scheduled jobs | [`docs/operations/ci.md`](docs/operations/ci.md), [`docs/operations/jobs/`](docs/operations/jobs/) |
| Runbooks | [`docs/operations/runbooks/`](docs/operations/runbooks/) |
| Durable learnings | [`docs/knowledge/learnings.md`](docs/knowledge/learnings.md) |
| Failed approaches (don't retry) | [`docs/knowledge/failed-approaches.md`](docs/knowledge/failed-approaches.md) |
| Historical snapshots | [`docs/archive/`](docs/archive/) |

## Documentation maintenance rules

1. **Markdown in `docs/` is the source of truth.** If a fact is canonical
   there, do not also keep the canonical copy in the README, here, or in
   code comments — link instead.
2. **Code and executable config remain authoritative** for implementation
   details and schedules (CI workflows, `package.json` scripts,
   `wrangler.toml`, `vite.config.js`). Docs describe *why* and *how to
   operate*; code describes *what runs*.
3. **Do not duplicate facts easily discoverable from code.** A doc explains
   non-obvious constraints, operational procedures, decisions, and reusable
   failures — not the file tree.
4. **ADRs are append-only.** When a decision is reversed, add a new ADR
   that supersedes the old one; do not silently edit the old ADR.
5. **Stale docs go to `docs/archive/`** (preserving git rename history), not
   the trash. Never delete useful history.
6. **No empty placeholder docs.** If a page would be empty, do not create it.
7. **Run `pnpm docs:validate` before committing doc changes.** CI enforces
   it on every PR.
8. **Blume is only the presentation layer.** `blume.config.ts` renders
   `docs/`; it is not a source of truth. Generated Blume files (`.blume/`,
   `dist-docs/`) are gitignored.

## Repo structure (high level)

```
src/                 React SPA (pages, components, hooks, data, lib, adapters)
api/                 Legacy local handlers (.mjs) — kept for local dev parity
handlers/            Action handlers shared by api/ and functions/
functions/api/       Cloudflare Pages Functions (production catch-all)
shared/              Code shared between api/ and functions/ (db, lib, fixtures)
scripts/             Content pipelines + env validation + deploy helpers
public/              Static assets + agent surfaces (llms.txt, index.md, sitemap)
docs/                Canonical documentation tree (this is the source of truth)
docs/learning/       In-product roadmap markdown (Vite-globbed — do not move)
```

The detailed component map lives in the codebase; this bootloader
intentionally does not restate it.

<!-- FLEET-GUIDANCE:START -->

## Fleet Guidance

### Adding Tasks
- Add durable work items in SaaS Maker Cockpit Tasks when the task affects product behavior, deployment, user feedback, or fleet maintenance.
- Include the project slug, a concise title, acceptance criteria, priority/status, and links to relevant code, issues, traces, or dashboards.
- If task discovery starts locally in an editor or agent session, mirror the durable next step back into SaaS Maker before handoff.

### Using SaaS Maker
- Treat SaaS Maker as the system of record for project metadata, feedback, tasks, analytics, testimonials, changelog, and fleet visibility.
- Prefer API-first workflows through `fnd api`, the SDK, or widgets instead of one-off scripts when interacting with SaaS Maker features.
- Keep this agent file aligned with the project record when operating rules, integrations, or deployment conventions change.

### Free AI First
- Prefer free/local AI paths for routine development and analysis: the `free-ai` gateway, local models, provider free tiers, and cached context.
- Escalate to paid models only when complexity, correctness risk, or missing capability justifies the cost.
- Note any paid-AI use in the task or handoff when it materially affects cost, reproducibility, or future maintenance.

<!-- FLEET-GUIDANCE:END -->

## Active context

See [`STATUS.md`](STATUS.md) for the current objective, active work, blockers,
and next steps.
