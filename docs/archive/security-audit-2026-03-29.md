# Security Audit

Audit date: 2026-03-29

## Critical

- [x] **No auth on /api/chat.mjs** — `api/chat.mjs:56` — Endpoint spawns CLI subprocesses with no authentication. Any unauthenticated user can invoke server-side CLI tools (claude, codex, gemini). Add `requireAuth` middleware, return 401.

- [x] **No auth on /api/go-run.mjs** — `api/go-run.mjs:1` — Endpoint proxies code to go.dev with no authentication. Add `requireAuth` middleware, return 401.

- [x] **JWT hardcoded fallback secret** — `api/auth/verify.mjs:4` — `JWT_SECRET` falls back to `'dev-secret-change-in-production'`. If env var is missing in prod, all tokens are signed with a known secret. Remove fallback, throw if not set.

- [x] **JWT hardcoded fallback secret** — `api/auth/google.mjs:7` — Same `'dev-secret-change-in-production'` fallback. Remove fallback, throw if not set.

- [x] **User progress only in localStorage** — `src/hooks/useProgress.ts` and `src/hooks/useSpacedRepetition.ts` — Authenticated users lose all progress/review data on device change. Add `user_progress` table to Turso. Sync to DB on change (debounced). Keep localStorage as offline fallback.

## High

- [x] **Auth error leaks server config** — `api/auth/google.mjs:68-71` — Catch block returns `hasClientId`, `clientIdLength` in 401 response. Leaks whether Google Client ID is configured and its length. Return generic error only.

## Medium

- [x] **Google API key in URL parameter** — `src/hooks/useAI.ts:174` — `streamGoogle()` sends API key as `?key=` URL param. URL params are logged in server access logs, browser history, and CDN caches. Move to `x-goog-api-key` header.

## Low

- [ ] **server/ is a git submodule with node_modules** — `server/` is tracked as a submodule. Its `node_modules/` directory exists locally but the submodule ref is committed. Verify `server/node_modules` is not tracked inside the submodule.

- [ ] **`dev-secret-change-in-production` in git history** — Commit `26c3eb4` introduced the hardcoded fallback. After fixing, consider rotating JWT_SECRET in production.

## Info

- `.env.local` is covered by `*.local` in `.gitignore` — not committed. Good.
- `.env.example` contains only placeholder values — safe.
- `api/chats.mjs`, `api/notes.mjs`, `api/problems.mjs` already use `requireAuth`. Good.
- Parameterized SQL queries used throughout — no SQL injection risk. Good.
