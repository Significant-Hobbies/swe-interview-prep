# swe-interview-prep — PROJECT_STATUS

Last updated: 2026-07-13

## Why/What

SWE Interview Prep is a single-platform interview prep and Fleet learning product covering DSA, low-level design (LLD), system design (HLD), behavioral practice, and project learning tracks. It combines Monaco coding, Excalidraw diagramming, multi-provider AI hints, spaced repetition, LeetCode import, progress tracking, and pattern-based learning. Deployed on Cloudflare Pages with Pages Functions backend.

Out of scope: ATS/job-application features, Vercel/serverless migration, and new auth providers until the Cloudflare path is stable.

## Dependencies

| Layer | Choice |
|-------|--------|
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| Editor / viz | Monaco Editor, Excalidraw, Go WASM interpreter (R2-hosted) |
| Backend | Cloudflare Pages Functions (`functions/api/[[path]].js`) |
| Database | Turso (libSQL) — problems, progress, notes, spaced repetition |
| Auth | Google One Tap → JWT httpOnly cookie |
| AI | Vercel AI SDK — Anthropic, Google Gemini, OpenAI/DeepSeek; in-process Vite dev AI bridge (CLI, no keys) |
| SRS | ts-fsrs (SM-2-style scheduling) |
| Analytics | PostHog (local `posthog-js` wrapper) |
| Deploy | Cloudflare Pages (`swe-interview-prep`) + Functions |
| CI | GitHub Actions — auto-deploy on push to `main` |

**Local dev:** `pnpm install && cp .env.example .env.local && pnpm dev`

**Key checks:** `pnpm build` · frontend typecheck · auth/API smoke per README

```
React SPA (Vite)
    │
    ├── Monaco + Go WASM code execution (R2 asset)
    ├── Excalidraw diagrams
    ├── AI hints (useAI) ──► Cloudflare Functions /api/chat (prod) OR in-process Vite dev bridge
    ├── Progress + SRS hooks ──► Turso via Functions
    └── Google One Tap ──► /api/auth/google ──► JWT cookie

Turso tables: problems, user_progress, notes, spaced_repetition, chats
External: LeetCode API (import), multi-provider LLM APIs
```

**Dev bridge:** `vite-plugin-local-ai.js` — a dev-only Vite plugin (`apply: 'serve'`) that mounts `/api/chat` (streams the claude/codex/gemini CLIs over SSE) plus in-memory stubs for chats/progress/notes/auth. Runs in-process with Vite (no separate server, no proxy hop), ships nothing to prod. `codex` runs read-only/ephemeral on `codex login` — no API keys for local iteration. Replaced the former `local-ai` git submodule (2026-06-27).

**Security posture (post-audit):** `/api/chat` and `/api/go-run` require auth; JWT secret has no production fallback; Google API key moved to header; progress syncs to Turso for authenticated users (localStorage offline fallback retained).

| Concern | Detail |
|---------|--------|
| Hosting | Cloudflare Pages project `swe-interview-prep` |
| Database | Turso — connection via Pages Functions env |
| Auth | Google OAuth; set callback URLs for localhost and production Pages domain |
| R2 | `swe-interview-prep-assets` — Go WASM binary |
| AI keys | Provider keys in Pages env; dev uses in-process Vite AI bridge (CLI, no keys) |
| Deploy | Push to `main` (CI) or manual Pages deploy |
| Local full stack | `pnpm dev` (Vite + in-process AI bridge) |
| Security | Never commit `.env.local`; parameterized SQL throughout |

## Timeline

| Phase | Milestone |
|-------|-----------|
| Platform migration | Cloudflare Pages static frontend + Pages Functions backend; Turso persistence; Google One Tap auth |
| Core study surfaces | DSA practice (Monaco), LLD/HLD (Excalidraw), behavioral/concept routes, Build Lab, Playground |
| Learning loops | Progress tracking across categories; ts-fsrs spaced repetition; multi-provider AI hints |
| Execution path | R2-backed Go WASM interpreter for in-browser code execution |
| Security hardening (2026-03-29) | Auth middleware on chat/go-run; JWT env guard; Turso progress sync; Google API key header fix (AUDIT.md) |
| Ops polish (2026-06-20) | `.env.example`, Husky pre-commit, PostHog integration, README architecture docs |
| Feynman Gate → FSRS progression (2026-06-29) | Wired the explain-back gate into the default drill loop: drill → explain → mastery update → next weakest concept |
| Unified learning sources (2026-07-12) | Added reference-only catalogs for all 19 active Fleet projects, project roadmaps, research paths, private Reader saves, High Signal, and 12 embedded GitHub learning repositories. Owner-only 30-minute sessions support source selection, unlimited daily runs, end-of-session questions, and FSRS rescheduling. `posttrainllm` uses the `tinygpt` repository as its canonical source. |
| High Signal learning feed (2026-07-13) | Replaced the synthetic daily placeholder with a validated `high-signal.learning-brief.v1` adapter. Sync preserves source citations and retains the last good briefing with `stale` status on network/schema failure. External item detail now saves item-scoped takeaways and opens a prefilled Playground artifact prompt. |

## Products

**Primary routes:** `/` (dashboard) · `/learn` · `/practice` · `/library` · `/sources` · `/session/:date/:sessionId` · `/playground` · `/progress` · `/build-lab` · concept/roadmap/project detail pages · `/login`

**Primary API (Pages Functions):** `/api/auth/google` · `/api/problems` · `/api/notes` · `/api/chats` · `/api/chat` · `/api/go-run` · progress and spaced-repetition endpoints

| Surface | Role |
|---------|------|
| Dashboard | Study hub and navigation |
| DSA practice | Monaco editor, pattern-based grouping, LeetCode import |
| LLD / HLD | Excalidraw architecture diagrams |
| Learn / concepts | Structured concept and roadmap content |
| Build Lab | Hands-on build exercises |
| Playground | Isolated coding sandbox |
| Progress | Completion rates across DSA, LLD, HLD, behavioral |
| Spaced repetition | Anki-style review with ts-fsrs scheduling |

## Features (shipped)

### Platform and deploy
- Cloudflare Pages static frontend + Pages Functions backend in production architecture.
- Turso/libSQL persistence for problems, notes, chats, and authenticated progress.
- Google One Tap auth with httpOnly JWT cookie issuance.
- R2-backed Go WASM interpreter for in-browser code execution path.
- PostHog analytics integration.
- Checked-in `.env.example` for required variables.
- Husky pre-commit hooks; Biome/ESLint toolchain.

### Core study surfaces
- **Unified learning sources:** `/sources` indexes all 19 active Fleet project study queues and research-paper paths without copying canonical source bodies. The source catalog, source detail, and session routes require the configured owner Google account.
- **Adaptive daily sessions:** `/session/:date/:sessionId` creates a fresh 30-minute session. The owner can choose any populated source or use the balanced High Signal + due-learning plan, run unlimited sessions per day, answer questions at the end, and have recall quality scheduled through the existing FSRS implementation.
- **Private Reader adapter:** saved Reader articles load at request time through the authenticated server proxy. Article bodies and Reader credentials are never emitted into the static catalog or client bundle.
- **High Signal adapter:** the checked-in registry consumes the versioned compact daily feed, rejects unsupported payloads, and fails stale instead of inventing fresh content.
- **External learning handoff:** project, research, briefing, and Reader items can be studied in sessions, marked for FSRS review, saved into the notes store, and opened as a prefilled Playground exercise without changing native concepts.
- **Repository Library:** `/library` restores 12 embedded GitHub learning repositories with searchable source cards, original section hierarchy, and repository exercises in read/practice modes behind owner authentication.
- **DSA practice:** Monaco editor, pattern-based problem grouping (sliding window, two pointers, etc.), LeetCode import via API.
- **LLD / HLD:** Excalidraw integration for architecture diagrams on problem views.
- **Behavioral / concepts:** Learn and concept-detail routes with structured content paths.
- **Build Lab** and project-detail surfaces for hands-on build exercises.
- **Playground** isolated coding sandbox route.
- **Progress tracking:** completion rates across DSA, LLD, HLD, and behavioral categories (`useProgress`).
- **Spaced repetition:** Anki-style review flow with ts-fsrs scheduling (`useSpacedRepetition`, review pages).
- **Feynman Gate → FSRS progression (default flow):** solving a drill triggers a skippable explain-back nudge; the AI-graded explanation maps onto per-concept FSRS ratings (`feynmanRating`), updates mastery, then surfaces a "next weakest concept" card (BuildLab) so the loop closes: drill → explain → mastery update → next weakest concept. Playground's manual gate also refreshes mastery on grade.
- **AI assistance:** multi-provider Socratic hints without spoilers (`useAI`); local-ai dev path documented.

### Auth and API hardening (AUDIT.md 2026-03-29)
- Auth middleware on `/api/chat.mjs` and `/api/go-run.mjs` (401 for unauthenticated).
- JWT `dev-secret-change-in-production` fallback removed — env required in prod.
- Authenticated user progress and SRS data sync to Turso (debounced); localStorage retained as offline fallback.
- Auth error responses no longer leak `hasClientId` / `clientIdLength`.
- Google streaming API key sent via `x-goog-api-key` header instead of URL param.

### Documentation
- README architecture diagram (Mermaid) and run steps for Cloudflare + Turso setup.
- AUDIT.md tracks resolved critical/high/medium findings.

## Todo / Planned / Deferred / Blocked

### Planned
1. Configure the Cloudflare Pages `READER_API_TOKEN` secret to activate the private live Reader adapter.
2. Persist external learning progress and assessment feedback through the authenticated learning API; local storage is the first usable slice.
3. ~~Docs alignment.~~ **Paused** — Cloudflare Pages architecture is canonical; stale historical references remain non-operational.
2. ~~Auth/API verification pass.~~ **Paused** after current local typecheck and security baseline.
3. ~~Regression tests.~~ **Paused** at existing focused coverage.
4. ~~Coherent study-flow polish.~~ **Paused** with the drill → Feynman Gate → FSRS loop as the retained baseline.

### Closure

- **Personal-use support (2026-07-10):** Keep SWE Interview Prep available for direct use. No roadmap expansion; accept only maintenance, reliability, or personally requested workflow fixes.

### Deferred
- Vercel/serverless migration instructions — stale; do not guide new work.
- Broad ATS, job boards, or application-tracking features.
- New backend providers or alternate auth modes until Cloudflare path is proven stable.
- Paid tiers or team workspaces.

### Blocked / Known gaps
- Some README/migration docs may still reference pre-Pages architecture — alignment pass needed.
- Low-severity audit items open: submodule `node_modules` verification; consider JWT_SECRET rotation after fallback removal (commit history exposure).
- End-to-end CI against live Turso + Cloudflare bindings is operator-dependent, not fully automated in repo.
