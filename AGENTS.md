# agents.md — swe-interview-prep (Loop)

## Shared Fleet Standard

Also read and follow the shared fleet-level agent standard at `../AGENTS.md`. Treat this repository as owned product code: protect production stability, keep changes scoped, verify work, and record durable follow-up tasks when something remains incomplete or blocked.

## Purpose
Personal SWE Learning OS — a 5-tab command center (Learn, Practice, Playground, Mock, Progress) that drives the loop Concept → Drill → Build → Review → Apply across 8 tracks (search-ir, vector-db, ai-systems, backend, databases, system-design, dsa, product). FSRS spaced repetition tracks concept mastery; the Playground (Monaco + Excalidraw + Socratic AI + Feynman Gate) is the build/drill workspace. Detail pages (concept, roadmap, project, drill) are reachable from inside the five tabs.

## Stack
- Framework: React 19 SPA (React Router v7), Vite 8
- Language: TypeScript (strict: false)
- Styling: Tailwind CSS v4
- DB: Turso (libSQL via `@libsql/client`) — schema auto-initialized on first server start
- Auth: Google One Tap + JWT (no OAuth redirect flow)
- Testing: Vitest (unit), Playwright (e2e in `tests/e2e/`)
- Deploy: Cloudflare Pages (frontend: `vite build → dist/`; backend: Pages Functions in `functions/api/[[path]].js`)
- Package manager: pnpm

## Repo structure
```
src/                    # React SPA
  App.tsx               # React Router routes — 5 primary tabs + detail pages + legacy redirects
  pages/                # Learn, Practice, Playground, MockInterview, Progress (5 tabs)
                        # ConceptDetail, RoadmapDetail, ProjectDetail, BuildLab (detail/sub pages)
                        # About, Privacy, Login (static)
  components/
    viz.tsx             # SVG primitives: Ring, MasteryDonut, StackedBar,
                        # ConceptChain, MilestoneTimeline, Sparkline
    ui.tsx              # Shared UI kit (PageShell, Card, Badge, color tokens…)
    Layout.tsx          # 5-tab nav shell (desktop top nav + mobile bottom bar — all 5 fit)
    CodeEditor.tsx      # Monaco editor wrapper
    DiagramEditor.tsx   # Excalidraw wrapper
    CompanionPanel.tsx  # Socratic AI (never gives solutions, only probes)
    FeynmanGate.tsx     # Explain-back modal → AI grades 0-100 → mastery update
  hooks/                # All stateful logic (components are thin)
    useUserStore.ts     # Hybrid localStorage+DB stores (artifacts/drills/projects/notes)
  data/
    learning-os.ts      # Typed loaders for all static content below
    concepts.json       # ~125 concepts across 8 tracks
    tracks.json roadmaps.json artifacts.json drills.json
    projects.json review-questions.json
    problems.json lld-/hld-/behavioral-problems.json  # back Playground + Mock
  lib/
    fsrs.ts             # Client FSRS wrapper (ts-fsrs)
    userStore.ts        # Pure localStorage+merge helpers (unit-tested)
    conceptState.ts     # Derives concept status/confidence from FSRS mastery
    recommend.ts        # "What should I do next?" dashboard logic
api/                    # Legacy Vercel-style handlers (.mjs) — kept for local dev
  _lib/                 # Shared: DB client, schema, AI helpers
  ai/                   # chat.ts (streaming proxy), models.ts
  auth/                 # Google JWT verify, token issue
  learning.mjs          # Multi-action endpoint (artifacts/drills/projects/notes/concepts)
  chat.mjs chats.mjs notes.mjs problems.mjs progress.mjs go-run.mjs
functions/api/          # Cloudflare Pages Functions (production)
  [[path]].js           # Single catch-all routes /api/* to the same handler logic
shared/                 # Shared between api/, functions/, and server/
  db/                   # Schema, client, users
  lib/                  # AI helpers, FSRS (server), heuristics
server/                 # Local Express AI proxy (git submodule) — port 3456
  index.mjs             # Proxies claude/codex/gemini CLI calls
public/wasm/            # Go WASM interpreter (go-interp.wasm, wasm_exec.js)
```

## Key commands
```bash
pnpm dev            # Express AI server (:3456) + Vite (:5173) concurrently
pnpm dev:frontend   # Vite only
pnpm server         # ensure submodule deps, then Express AI server only
pnpm build          # vite build → dist/
pnpm test           # vitest run
pnpm test:e2e       # playwright test
pnpm lint           # ESLint
```

## Architecture notes
- **5-tab Learning OS**: Learn (roadmap journey + concepts), Practice (drills + reviews), Playground (Monaco/Excalidraw build surface), Mock (timed interview), Progress (mastery rollups + notes). Core principle — "no learning without an artifact": every concept maps to drills + an artifact you build. Detail pages (`/concepts/:id`, `/roadmaps/:id`, `/projects/:id`, `/drills/:id`) are reachable from inside the tabs.
- **Legacy redirects**: `/today`, `/dashboard`, `/roadmaps`, `/concepts` → `/learn`; `/drills`, `/reviews`, `/review` → `/practice`; `/build`, `/vibe-learning` → `/playground`; `/projects`, `/notes` → `/progress`. Listed in `src/App.tsx` so external links keep working.
- **Visualization layer**: `src/components/viz.tsx` exposes hand-rolled SVG primitives (no chart-lib dep): Ring, MasteryDonut, StackedBar, ConceptChain, MilestoneTimeline, Sparkline. Palette matches Tailwind `*-500` swatches; reused by Learn / Practice / Progress.
- **Static content vs user state**: concepts/roadmaps/drills/artifacts/projects/review-questions are static JSON in `src/data/` (loaded via `learning-os.ts`); mutable user state is hybrid — localStorage for guests, Turso DB for signed-in users (`useUserStore`).
- **DB**: `concept_mastery` (FSRS) + `user_artifacts` / `user_drills` / `user_projects` / `user_learning_notes`. API actions consolidated under `/api/learning?action=…` (`artifacts`, `drills`, `projects`, `notes`) to respect the Vercel 12-function cap.
- **FSRS spaced repetition** (`ts-fsrs`): per-user per-concept state in `concept_mastery` DB table. Confidence formula: `(1 + elapsed/(9×stability))^-1`. Mastery decays over time.
- **Socratic AI**: `CompanionPanel.tsx` — never gives direct solutions, only probes understanding. This is intentional behavior — do not change it.
- **Auto-tagging**: after 5 minutes of stable code, `useTagger` POSTs to `/api/tag`. AI returns concept tags with depth (surface/working/deep) → mapped to FSRS ratings → bulk concept update.
- **Feynman Gate**: user explains code in plain English → AI grades 0-100 + returns gaps → updates per-concept mastery. Gaps trigger `again`/`hard` FSRS ratings.
- **Go execution**: WASM-based Go runner in `public/wasm/`. `/api/go-run.mjs` handles execution.
- **`server/` is a git submodule** — local Express AI proxy. Clone with `git submodule update --init`.
- **Local server dependencies**: `pnpm dev` and `pnpm server` run `npm --prefix server ci --ignore-scripts` before starting the submodule server.
- **DB auto-init**: schema tables created on server startup — no migration runner needed.
- **AI is multi-provider**: client passes `aiConfig: {endpointUrl, apiKey, model}` to any API endpoint; server falls back to `AI_ENDPOINT_URL`/`AI_API_KEY`/`AI_MODEL` env vars.
- **Guest mode**: artifacts, drills, projects, and notes persist to localStorage. Concept mastery (FSRS reviews) is DB-backed and needs Google sign-in; signing in merges localStorage state into the DB.

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
