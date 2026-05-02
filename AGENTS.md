# agents.md — swe-interview-prep (Loop)

## Purpose
SWE interview prep tool — Playground (Monaco + Excalidraw + Socratic AI + Feynman Gate) with FSRS spaced repetition for concept mastery tracking.

## Stack
- Framework: React 19 SPA (React Router v7), Vite 8
- Language: TypeScript (strict: false)
- Styling: Tailwind CSS v4
- DB: Turso (libSQL via `@libsql/client`) — schema auto-initialized on first server start
- Auth: Google One Tap + JWT (no OAuth redirect flow)
- Testing: Vitest (unit), Playwright (e2e in `tests/e2e/`)
- Deploy: Vercel (frontend: `vite build → dist/`; backend: Vercel serverless functions in `api/`)
- Package manager: pnpm

## Repo structure
```
src/                    # React SPA
  App.tsx               # React Router routes (4 pages: Today, Playground, Concepts, Review)
  pages/
    Today.tsx           # Daily AI-generated recommendation card
    Playground.tsx      # Monaco + Excalidraw + Companion + Feynman Gate
    Concepts.tsx        # FSRS mastery heatmap
    Review.tsx          # Weekly AI report
  components/
    CodeEditor.tsx      # Monaco editor wrapper
    DiagramEditor.tsx   # Excalidraw wrapper
    CompanionPanel.tsx  # Socratic AI (never gives solutions, only probes)
    FeynmanGate.tsx     # Explain-back modal → AI grades 0-100 → mastery update
    AmbientLibrary.tsx  # Concept → library section browser
  hooks/                # All stateful logic (components are thin)
  data/
    concepts.json       # 60-concept taxonomy (DSA/LLD/HLD/Behavioral)
    problems.json       # DSA problems (legacy SM-2, retained for data continuity)
    lld-problems.json
    hld-problems.json
    behavioral-problems.json
  lib/
    fsrs.ts             # Client FSRS wrapper (ts-fsrs)
api/                    # Vercel serverless functions (.mjs)
  _lib/                 # Shared: DB client, schema, AI helpers
  ai/                   # chat.ts (streaming proxy), models.ts
  auth/                 # Google JWT verify, token issue
  daily.mjs             # GET cached / POST regen daily plan
  weekly.mjs            # GET latest / POST regen weekly review
  concepts.mjs          # GET mastery / POST review / PUT bulk update
  tag.mjs               # POST code → AI concept tags
  feynman.mjs           # POST explanation → AI grade + gaps
  go-run.mjs            # Go WASM execution
shared/                 # Shared between api/ and server/
  db/                   # Schema, client, users
  lib/                  # AI helpers, FSRS (server), heuristics
server/                 # Local Express AI proxy (git submodule) — port 3001
  index.mjs             # Proxies claude/codex/gemini CLI calls
public/wasm/            # Go WASM interpreter (go-interp.wasm, wasm_exec.js)
```

## Key commands
```bash
pnpm dev            # Express server (:3001) + Vite (:5173) concurrently
pnpm dev:frontend   # Vite only
pnpm server         # Express AI server only
pnpm build          # vite build → dist/
pnpm test           # vitest run
pnpm test:e2e       # playwright test
pnpm lint           # ESLint
```

## Architecture notes
- **4-page app only**: Today → Playground → Concepts → Review. No nav menus. Playground is the core; everything feeds it or learns from it.
- **FSRS spaced repetition** (`ts-fsrs`): per-user per-concept state in `concept_mastery` DB table. Confidence formula: `(1 + elapsed/(9×stability))^-1`. Mastery decays over time.
- **Socratic AI**: `CompanionPanel.tsx` — never gives direct solutions, only probes understanding. This is intentional behavior — do not change it.
- **Auto-tagging**: after 5 minutes of stable code, `useTagger` POSTs to `/api/tag`. AI returns concept tags with depth (surface/working/deep) → mapped to FSRS ratings → bulk concept update.
- **Feynman Gate**: user explains code in plain English → AI grades 0-100 + returns gaps → updates per-concept mastery. Gaps trigger `again`/`hard` FSRS ratings.
- **Go execution**: WASM-based Go runner in `public/wasm/`. `/api/go-run.mjs` handles execution.
- **`server/` is a git submodule** — local Express AI proxy. Clone with `git submodule update --init`.
- **DB auto-init**: schema tables created on server startup — no migration runner needed.
- **AI is multi-provider**: client passes `aiConfig: {endpointUrl, apiKey, model}` to any API endpoint; server falls back to `AI_ENDPOINT_URL`/`AI_API_KEY`/`AI_MODEL` env vars.
- **Guest mode**: partial (no concept mastery, no daily/weekly plan). Full loop requires Google sign-in.

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
