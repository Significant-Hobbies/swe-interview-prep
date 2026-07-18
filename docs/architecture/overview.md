# Architecture Overview

A React 19 SPA served as static files by Cloudflare Pages, with a Pages
Functions backend (`functions/api/[[path]].js`) that talks to Turso (libSQL)
and proxies to multi-provider LLMs. The same handler logic runs locally through
a Vite plugin so dev needs no separate server.

```
React SPA (Vite build → dist/)
    │
    ├── Monaco + Go WASM code execution (R2-hosted binary)
    ├── Excalidraw diagrams
    ├── Socratic AI (useAI) ──► /api/chat ──► Pages Functions ──► LLM providers
    ├── Progress + FSRS hooks ──► /api/learning, /api/progress ──► Turso
    ├── Learning library + sources ──► owner-only handlers ──► Turso + remote repos
    └── Google One Tap ──► /api/auth/google ──► httpOnly JWT cookie

Local dev: vite-plugin-local-ai.js mounts /api/chat (streams claude/codex/gemini
CLIs over SSE) + in-memory stubs for chats/progress/notes/auth. Ships nothing
to prod.
```

## Layers

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | React 19 SPA, Vite 8, React Router v7, Tailwind v4 | TypeScript (strict: false) |
| Editor / viz | Monaco, Excalidraw, hand-rolled SVG primitives in `src/components/viz.tsx` | No chart-lib dep |
| Code execution | Go WASM interpreter hosted on R2 (`swe-interview-prep-assets`) | `/api/go-run` proxies; auth required |
| Backend | Cloudflare Pages Functions, single catch-all `functions/api/[[path]].js` | Routes to `handlers/` + `shared/` |
| DB | Turso (libSQL via `@libsql/client`) | Schema auto-init on first cold start; no migration runner |
| Auth | Google One Tap → JWT httpOnly cookie | No OAuth redirect flow |
| AI | Vercel AI SDK — Anthropic, Google Gemini, OpenAI/DeepSeek; multi-provider per request | Dev uses in-process CLI bridge, no keys |
| Spaced repetition | `ts-fsrs` (client + server wrappers) | Per-user per-concept state in `concept_mastery` |
| Analytics | PostHog (`src/lib/analytics.ts`) | Local wrapper |
| Deploy | Cloudflare Pages + Functions; GitHub Actions on push to `main` | See [`../operations/deploy.md`](../operations/deploy.md) |
| Package manager | pnpm | |

## Source layout (high level)

```
src/                 React SPA (pages, components, hooks, data, lib, adapters)
api/                 Legacy local handlers (.mjs) — kept for local dev parity
handlers/            Action handlers used by both api/ and functions/
functions/api/       Cloudflare Pages Functions (production catch-all)
shared/              Code shared between api/ and functions/ (db, lib, handlers, fixtures)
scripts/             Content pipelines + env validation + deploy helpers
public/              Static assets, agent surfaces (llms.txt, index.md, sitemap, robots)
docs/                This documentation tree
docs/learning/       In-product roadmap markdown (Vite-globbed into the SPA — do not move)
```

The full file-by-file map lives in `../AGENTS.md` (agent bootloader). This page
intentionally does not restate it.

## Key subsystems

- **Static content vs user state.** Concepts, roadmaps, drills, artifacts,
  projects, and review-questions are static JSON in `src/data/` loaded via
  `learning-os.ts`. Mutable user state is hybrid: localStorage for guests,
  Turso for signed-in users (`useUserStore`). Signing in merges localStorage
  into the DB.
- **FSRS spaced repetition.** Per-user per-concept state in `concept_mastery`.
  Confidence formula: `(1 + elapsed/(9×stability))^-1`. Mastery decays over
  time. The Feynman Gate grades explain-backs 0–100 and maps gaps onto
  `again`/`hard` FSRS ratings.
- **Socratic AI.** `CompanionPanel.tsx` never gives direct solutions, only
  probes understanding. This is intentional product behavior — see
  [`decisions/0005-socratic-no-solutions.md`](decisions/0005-socratic-no-solutions.md).
- **Auto-tagging.** After 5 minutes of stable Playground code, `useTagger`
  POSTs to `/api/tag`; AI returns concept tags with depth
  (surface/working/deep) → mapped to FSRS ratings → bulk concept update.
- **Dev AI bridge.** `vite-plugin-local-ai.js` (`apply: 'serve'`) mounts
  `/api/chat` (streams the claude/codex/gemini CLIs over SSE) plus in-memory
  stubs. Replaced the old `local-ai` git submodule — see
  [`decisions/0006-dev-ai-bridge-inprocess.md`](decisions/0006-dev-ai-bridge-inprocess.md).
- **DB auto-init.** `initDatabase()` creates tables `IF NOT EXISTS` on first
  cold start. No migration runner; additive schema changes only.
- **Multi-provider AI.** Clients pass `aiConfig: {endpointUrl, apiKey, model}`
  to any AI endpoint; the server falls back to `AI_ENDPOINT_URL` /
  `AI_API_KEY` / `AI_MODEL` env vars.

## Database tables

Schema source of truth: `shared/db/schema.mjs` (and the parallel init in
`functions/api/[[path]].js`). Tables: `users`, `user_chats`, `user_notes`,
`user_imported_problems`, `user_progress`, `activity_log`, `concept_mastery`,
`daily_plan`, `weekly_review`, `feynman_logs`, `user_artifacts`,
`user_drills`, `user_projects`, `user_learning_notes`, `user_profile`,
`review_question_mastery`, `user_elo_state`, `user_imported_reviews`,
`user_push_subscriptions`.

The `/api/learning?action=…` endpoint consolidates artifact/drill/project/note/
concept/gaps mutations to keep the serverless API surface small.

## Related docs

- [`data-flow.md`](data-flow.md) — request lifecycle, guest vs auth, static vs user state
- [`decisions/`](decisions/) — why each major choice was made
- [`../operations/deploy.md`](../operations/deploy.md) — how it ships
