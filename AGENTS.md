# Loop — Personal Engineering Growth Tool

Single-purpose app: every session must measurably raise engineering ability. Playground is the nucleus; everything else feeds it or learns from it.

## Core Loop

```
Today (one card) → Playground (build + AI Companion + Feynman) → Concepts (mastery decays) → tomorrow's Today is smarter → Sunday: brutal Weekly Review
```

## Tech Stack

- **Framework**: React 19 SPA, React Router v7
- **Build**: Vite 7
- **Language**: TypeScript (strict: false)
- **Styling**: Tailwind CSS v4
- **Database**: TursoDB (libSQL)
- **Auth**: Google One Tap + JWT
- **Backend**: Vercel serverless functions (`api/*.mjs`)
- **Local dev server**: Express on :3001 (local AI tools: claude/codex/gemini)
- **Code editor**: Monaco
- **Diagrams**: Excalidraw
- **AI**: Multi-provider streaming via OpenAI-compatible adapter
- **Spaced repetition**: ts-fsrs (concept-level), SM-2 (legacy problem-level, retained for data continuity)

## Routes (4 pages, no menus)

- `/` → **Today** — single AI-generated recommendation card
- `/playground` → **Playground** — Code + Diagram + Companion + Feynman gate
- `/concepts` → **Concepts** — mastery heatmap, drilldown, self-rate
- `/review` → **Weekly Review** — brutal AI report

## Architecture

```
src/
  main.tsx
  App.tsx                 # Routes only
  pages/
    Today.tsx             # One card. /api/daily.
    Playground.tsx        # Nucleus. Code + Diagram + Companion + Feynman gate.
    Concepts.tsx          # FSRS heatmap. Click → drawer w/ self-rate + practice.
    Review.tsx            # Weekly markdown report.
    Login.tsx
  components/
    CodeEditor.tsx
    DiagramEditor.tsx
    CompanionPanel.tsx    # Socratic AI sidebar in Playground
    FeynmanGate.tsx       # Modal: explain back → AI grades → mastery updates
    Layout.tsx
    MarkdownViewer.tsx
  hooks/
    useAI.ts              # Existing: per-problem chat (legacy infra)
    useCompanion.ts       # Playground Socratic agent. localStorage thread.
    useTagger.ts          # Idle 5min → AI tags code w/ concepts → bumps mastery
    useConcepts.ts        # Mastery state + review actions
    useCodeExecution.ts
    useSpacedRepetition.ts # SM-2, problem-level, retained
    useProgress.ts
    useNotes.ts
    useProblems.ts
  lib/
    fsrs.ts               # Client FSRS wrapper
  data/
    concepts.json         # ~60 concept taxonomy across DSA/LLD/HLD/Behavioral
    problems.json         # DSA (legacy, retained for future drilldown)
    lld-problems.json
    hld-problems.json
    behavioral-problems.json

api/
  db/schema.mjs           # Auto-init: users, chats, notes, progress, activity_log,
                          # concept_mastery, daily_plan, weekly_review, feynman_logs
  db/client.mjs
  lib/ai.mjs              # Server-side OpenAI-compatible call helper
  lib/fsrs.mjs            # Server FSRS
  auth/google.mjs
  auth/verify.mjs
  chat.mjs                # Local AI proxy (claude/codex/gemini)
  ai/chat.ts              # Remote AI streaming proxy
  ai/models.ts
  go-run.mjs              # Go execution
  chats.mjs               # Per-problem chat history
  notes.mjs               # Per-problem notes
  problems.mjs            # User-imported problems
  progress.mjs            # SM-2 problem progress
  activity.mjs            # POST event / GET range  ← personalization substrate
  concepts.mjs            # GET mastery / POST review / PUT bulk update
  tag.mjs                 # POST code → AI tags concepts
  feynman.mjs             # POST explanation → AI grades + extracts gaps
  daily.mjs               # GET cached / POST regen today's plan
  weekly.mjs              # GET latest / POST regen weekly review
```

## Key Concepts

### Concept Taxonomy
60 concepts in `src/data/concepts.json` w/ `id, name, category, prereqs[], description`. Categories: `dsa | lld | hld | behavioral`. Prereqs form a DAG used by daily planner.

### Mastery (FSRS)
Per-user per-concept FSRS state in `concept_mastery`. Confidence is a decay curve `(1 + elapsed_days / (9 * stability))^-1` — rots over time even without explicit reviews.

### Activity Log
Append-only event stream in `activity_log`. Source of truth for personalization. Kinds: `companion_turn, auto_tag, feynman, feynman_skip` (extend freely).

### Auto-Tagging
After 5 minutes of code stability in playground, `useTagger` POSTs to `/api/tag`. AI returns `[{concept_id, evidence, depth}]`. Depth maps to FSRS rating: `surface→hard, working→good, deep→easy`. Bulk concept review fired.

### Feynman Gate
Manual button in Playground toolbar. User explains code in plain English. AI grades 0-100, returns feedback + gaps + per-concept ratings. Ratings update mastery (gaps trigger `again`/`hard` ratings).

### Companion
Socratic agent panel in Playground. Sees code+lang+problem on every turn. Never writes solutions, only probes. Thread persisted to localStorage (last 40 messages).

### Daily Plan
`POST /api/daily` ingests mastery snapshot + 7d activity → AI picks one concept + task type (build/review/read/explain) + 15-45min target. Cached per-day. Today page hydrates from cache.

### Weekly Review
`POST /api/weekly` ingests 7d activity + mastery + Feynman grades → AI writes blunt markdown report (5 sections: Reality Check / What's Rotting / What You Avoided / Wins / Next Week's Bet). No cron — user clicks regenerate.

## AI Cost Posture

Heavy AI by design:
- **Companion**: streaming, on-demand
- **Tagger**: every 5min idle in playground (when code stabilized)
- **Daily plan**: ~once/day per user
- **Weekly review**: on-demand
- **Feynman grade**: per session close

All endpoints accept `aiConfig: { endpointUrl, apiKey, model }` from the client. Server falls back to env vars `AI_ENDPOINT_URL / AI_API_KEY / AI_MODEL` if absent (useful for cron later).

## Conventions

- **Hooks pattern**: stateful logic in custom hooks; components are thin
- **API endpoints**: Vercel default export `handler(req, res)`, `.mjs`
- **Auth guard**: `requireAuth(req, res)` — returns user or 401
- **Streaming**: SSE, `data: {json}\n\n`
- **No Redux/Zustand**: React state + localStorage + Turso

## Commands

```bash
pnpm dev              # Express AI server (:3001) + Vite (:5173)
pnpm dev:frontend     # Vite only
pnpm server           # AI server only
pnpm build            # vite build → dist/
pnpm fetch-library    # Clone library repos (legacy — kept for future ambient panel)
pnpm lint             # ESLint
```

Vercel build: `pnpm run build`

## Environment Variables

```bash
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
JWT_SECRET=
VITE_SAASMAKER_API_KEY=

# Optional server-side AI defaults (used when client omits aiConfig)
AI_ENDPOINT_URL=
AI_API_KEY=
AI_MODEL=
```

Guest mode partially works (no concept mastery, no daily/weekly). Full loop requires sign-in.

## Data Migration Notes

- Existing `user_progress` table (problem-level SM-2) preserved verbatim
- Existing `user_chats`, `user_notes`, `user_imported_problems` preserved
- New tables additive: `activity_log`, `concept_mastery`, `daily_plan`, `weekly_review`, `feynman_logs`
- Legacy pages removed: `Dashboard, Patterns, AnkiReview, ImportProblem, VibeLearning, Library, RepoView, Home, ProblemView`
- `CategoryContext` removed
- Legacy URLs (`/dsa/*`, `/library/*`, etc.) redirect to `/concepts`

## State of the Loop

**Done:**
- Schema migration (additive, non-destructive)
- 60-concept taxonomy
- ts-fsrs scheduler (client + server)
- 6 new API endpoints (activity, concepts, tag, feynman, daily, weekly)
- Companion sidebar in Playground
- Auto-tagging hook
- Feynman gate modal
- Concepts heatmap page
- Today page (one card)
- Weekly Review page
- Layout reduced to 4 nav items

**Deferred:**
- Ambient library panel (concept→library section index)
- Vercel cron for weekly auto-gen
- Tests
