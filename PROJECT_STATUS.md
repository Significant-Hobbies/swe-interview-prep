# swe-interview-prep — PROJECT_STATUS

Last updated: 2026-06-20

## Why/What

Interview Coder (`swe-interview-prep`) is a single-platform interview prep product covering DSA, low-level design (LLD), system design (HLD), and behavioral practice. It combines Monaco coding, Excalidraw diagramming, multi-provider AI hints, spaced repetition (Anki-style), LeetCode import, progress tracking, and pattern-based learning. Deployed on Cloudflare Pages with Pages Functions backend.

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

## Products

**Primary routes:** `/` (dashboard) · `/learn` · `/practice` · `/playground` · `/progress` · `/build-lab` · concept/roadmap/project detail pages · `/login`

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
- **DSA practice:** Monaco editor, pattern-based problem grouping (sliding window, two pointers, etc.), LeetCode import via API.
- **LLD / HLD:** Excalidraw integration for architecture diagrams on problem views.
- **Behavioral / concepts:** Learn and concept-detail routes with structured content paths.
- **Build Lab** and project-detail surfaces for hands-on build exercises.
- **Playground** isolated coding sandbox route.
- **Progress tracking:** completion rates across DSA, LLD, HLD, and behavioral categories (`useProgress`).
- **Spaced repetition:** Anki-style review flow with ts-fsrs scheduling (`useSpacedRepetition`, review pages).
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
1. **Docs alignment** — bring stale migration and deployment docs into alignment with Cloudflare Pages Functions architecture (remove Vercel references).
2. **Auth/API verification pass** — run full checklist against current Cloudflare configuration: Google OAuth callbacks, Turso bindings, R2 WASM asset URL, JWT rotation guidance.
3. **Regression tests** — add focused tests around previously fixed auth/API paths (`requireAuth`, JWT env guard, progress DB sync).
4. **Coherent study flows** — tighten navigation so DSA, LLD, system design, and behavioral practice feel like one system (shared progress cues, cross-links from dashboard).
5. **Submodule hygiene** — verify `server/` (local-ai submodule) does not track `node_modules`; document submodule update workflow.

### Deferred
- Vercel/serverless migration instructions — stale; do not guide new work.
- Broad ATS, job boards, or application-tracking features.
- New backend providers or alternate auth modes until Cloudflare path is proven stable.
- Paid tiers or team workspaces.

### Blocked / Known gaps
- Some README/migration docs may still reference pre-Pages architecture — alignment pass needed.
- Low-severity audit items open: submodule `node_modules` verification; consider JWT_SECRET rotation after fallback removal (commit history exposure).
- End-to-end CI against live Turso + Cloudflare bindings is operator-dependent, not fully automated in repo.
