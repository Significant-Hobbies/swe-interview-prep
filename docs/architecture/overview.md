# Architecture Overview

A React 19 SPA served as static files by Cloudflare Pages, with a Pages
Functions backend (`functions/api/[[path]].js`) that talks to Cloudflare D1.
In production the Pages Function serves a small route set (`auth/*`,
`progress`, `learning`, `learning/reader`, `ai`); AI generation runs through
the Vercel AI SDK against a BYO OpenAI-compatible endpoint. The legacy
`api/*.mjs` handlers run only under the local Vite dev bridge.

```
React SPA (Vite build → dist/)
    │
    ├── Monaco + Go code execution (client-side WASM from R2, API-proxy fallback)
    ├── Excalidraw diagrams
    ├── Systems Lab ──► pure virtual-time reducer + checked-in evidence graphs
    ├── Socratic AI (useAI) ──► /api/chat (dev bridge) / OpenAI-compatible endpoint
    ├── Progress + FSRS hooks ──► /api/learning, /api/progress ──► D1
    ├── Learning library + sources ──► owner-only /api/learning actions ──► D1 + remote repos
    └── Google One Tap ──► /api/auth/google ──► httpOnly JWT cookie

Local dev: vite-plugin-local-ai.js mounts /api/chat (streams claude/codex/gemini
CLIs over SSE) + in-memory stubs for chats/progress/notes/auth. Ships nothing
to prod.
```

## Layers

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | React 19 SPA, Vite 8, React Router v7, Tailwind v4 | TypeScript (strict: true) |
| Editor / viz | Monaco, Excalidraw, hand-rolled SVG primitives in `src/components/viz.tsx` | No chart-lib dep |
| Live media | Cloudflare RealtimeKit 2.0.1 | `@cloudflare/realtimekit` supplies the browser meeting core and `@cloudflare/realtimekit-react` provides React lifecycle hooks/providers. Tradeoff Wars lazy-loads both packages and renders its focused two-person controls locally to avoid shipping the general-purpose meeting UI. |
| Code execution | JavaScript/TypeScript only, entirely in-browser: sucrase transpiles, then the code runs in a sandboxed `srcdoc` iframe with a 5s timeout (`src/hooks/useCodeExecution.ts`). | No server round-trip; the Go executor was removed 2026-07-25 (see [ADR 0009](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0009-remove-go-runtime.md)) |
| Backend | Cloudflare Pages Functions, single catch-all `functions/api/[[path]].js` | Prod routes: `auth/*`, `progress`, `learning`, `learning/reader`, `ai`. `learning` dispatches to `handlers/` via `shared/` |
| DB | Cloudflare D1 via the Pages `DB` binding | Deterministic migrations under `migrations/d1/` |
| Auth | Google One Tap → JWT httpOnly cookie | No OAuth redirect flow |
| AI | Vercel AI SDK via `@ai-sdk/openai-compatible` against a BYO endpoint (`aiConfig` per request or `AI_*` env) | Dev uses in-process CLI bridge (claude/codex/gemini), no keys |
| Spaced repetition | `ts-fsrs` (client + server wrappers) | Per-user per-concept state in `concept_mastery` |
| Analytics | PostHog (`src/lib/analytics.ts`) | Local wrapper |
| Deploy | Cloudflare Pages + Functions; GitHub Actions `deploy.yml` (manual `workflow_dispatch`) | See [`../operations/deploy.md`](../operations/deploy.md) |
| Package manager | pnpm | |

## Source layout (high level)

```
src/                 React SPA (pages, components, hooks, data, lib, adapters)
api/                 Legacy local handlers (.mjs) — kept for local dev parity
handlers/            Fetch-style action handlers used by dispatchLearningAction
functions/api/       Cloudflare Pages Functions (production catch-all)
shared/              Code shared between api/ and functions/ (db, lib, handlers, fixtures)
scripts/             Content pipelines + env validation + deploy helpers
public/              Static assets, agent surfaces (llms.txt, index.md, sitemap, robots)
docs/                This documentation tree
docs/learning/       In-product roadmap markdown (Vite-globbed into the SPA — do not move)
```

The full file-by-file map lives in the [agent bootloader](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/AGENTS.md). This page
intentionally does not restate it.

## Key subsystems

- **Static content vs user state.** Concepts, roadmaps, drills, artifacts,
  projects, and review-questions are static JSON in `src/data/` loaded via
  `learning-os.ts`. Mutable user state is hybrid: localStorage for guests,
  D1 for signed-in users (`useUserStore`). Signing in merges localStorage
  into the DB.
- **Deterministic Systems Lab.** Versioned definitions under
  `src/data/systems-labs/` describe actors, controls, reachable transitions,
  truth planes, decisive evidence, and bounded broken-to-repaired
  configuration challenges. `src/lib/simulation/` validates configuration
  contracts and reduces scenarios with virtual time; it contains no adapter
  for Kubernetes, Git, cloud, shell, or database access. Attempts and verified
  configuration files remain account-scoped in localStorage. Only the existing
  authenticated Feynman path may turn an explanation grade into FSRS updates,
  and only after the configuration gate passes.
- **FSRS spaced repetition.** Per-user per-concept state in `concept_mastery`.
  Confidence formula: `(1 + elapsed/(9×stability))^-1`. Mastery decays over
  time. The Feynman Gate grades explain-backs 0–100 and maps gaps onto
  `again`/`hard` FSRS ratings.
- **Socratic AI.** `CompanionPanel.tsx` never gives direct solutions, only
  probes understanding. This is intentional product behavior — see
  [`decisions/0005-socratic-no-solutions.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0005-socratic-no-solutions.md).
- **Auto-tagging.** After 5 minutes of idle-but-stable Playground code
  (`IDLE_MS` in `src/hooks/useTagger.ts`), `useTagger` POSTs to
  `/api/learning?action=tag`; AI returns concept tags with depth
  (surface/working/deep) → mapped to FSRS ratings → bulk concept update.
- **Dev AI bridge.** `vite-plugin-local-ai.js` (`apply: 'serve'`) mounts
  `/api/chat` (streams the claude/codex/gemini CLIs over SSE) plus in-memory
  stubs. Replaced the old `local-ai` git submodule — see
  [`decisions/0006-dev-ai-bridge-inprocess.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0006-dev-ai-bridge-inprocess.md).
- **Deterministic D1 migrations.** Wrangler applies SQL from `migrations/d1/`
  before a deployment is switched. Request handlers never perform DDL.
- **BYO AI endpoint.** Clients pass `aiConfig: {endpointUrl, apiKey, model}`
  to any OpenAI-compatible endpoint; the server (`shared/lib/ai.mjs`, using
  `@ai-sdk/openai-compatible`) falls back to `AI_ENDPOINT_URL` / `AI_API_KEY`
  / `AI_MODEL` env vars. There are no native per-vendor SDK adapters; "multi
  provider" means any OpenAI-compatible gateway.

## Database tables

Schema source of truth: `migrations/d1/`. `shared/db/d1-client.mjs` adapts the
native binding to the existing handler result shape. Tables: `users`, `user_chats`, `user_notes`,
`user_imported_problems`, `user_progress`, `activity_log`, `concept_mastery`,
`daily_plan`, `weekly_review`, `feynman_logs`, `user_artifacts`,
`user_drills`, `user_projects`, `user_learning_notes`, `user_profile`,
`review_question_mastery`, `user_elo_state`, `user_imported_reviews`,
`user_push_subscriptions`.

The `/api/learning?action=…` endpoint consolidates every learning mutation to
keep the serverless API surface small. Action registry:
`shared/api/learning-registry.mjs` — public (no user auth): `gaps`, `critique`,
`understanding`, `tag`; auth-required: `activity`, `concepts`, `feynman`,
`weekly`, `artifacts`, `drills`, `projects`, `notes`, `profile`,
`review-mastery`, `elo`, `imported-reviews`.

## Related docs

- [`data-flow.md`](data-flow.md) — request lifecycle, guest vs auth, static vs user state
- [`decisions/README.md`](decisions/README.md) — why each major choice was made
- [`../operations/deploy.md`](../operations/deploy.md) — how it ships
