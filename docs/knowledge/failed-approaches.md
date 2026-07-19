# Failed Approaches

Reusable records of things that did not work, so they are not retried. Each
entry: what was tried, why it failed, what replaced it. Append-only.

## Supabase + Vercel + OAuth redirect

**Tried:** Supabase Postgres + Supabase OAuth (Google redirect) + Vercel
serverless functions. The original stack.

**Why it failed:** Two vendors for hosting + DB, heavy OAuth redirect UX for
a single-user-ish product, and a hardcoded `JWT_SECRET` fallback that the
2026-03-29 audit flagged. The fleet consolidated on Cloudflare.

**Replaced by:** Cloudflare Pages + Functions, Turso (libSQL), Google One
Tap + JWT cookie. See ADRs
[0001](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0001-cloudflare-pages-over-vercel.md),
[0002](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0002-turso-libsql.md),
[0003](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0003-google-one-tap-jwt.md). Full migration
notes archived at
[`migration-supabase-to-turso.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/archive/migration-supabase-to-turso.md).

**Do not** guide new work from the old Vercel/Supabase migration notes —
they are explicitly stale.

## `local-ai` git submodule for dev AI

**Tried:** A separate `local-ai` git submodule that ran its own server
process and proxied `/api/chat` to the claude/codex/gemini CLIs.

**Why it failed:** A second process to start, a proxy hop, and a submodule
ref to keep in sync — all for a dev-only path.

**Replaced by:** `vite-plugin-local-ai.js` — an in-process Vite plugin that
boots/dies with Vite and ships nothing to prod. See
[ADR 0006](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0006-dev-ai-bridge-inprocess.md).

## Hardcoded `JWT_SECRET` fallback

**Tried:** `JWT_SECRET` falling back to `'dev-secret-change-in-production'`
in `api/auth/verify.mjs` and `api/auth/google.mjs`.

**Why it failed:** If the env var was missing in prod, all tokens were signed
with a known secret. Commit `26c3eb4` exposed it in git history.

**Replaced by:** No fallback — the function throws if `JWT_SECRET` is unset.
Rotation is a known low-severity follow-up — see
[`../operations/runbooks/rotate-jwt-secret.md`](../operations/runbooks/rotate-jwt-secret.md).

## Google API key as URL parameter

**Tried:** `streamGoogle()` sent the API key as `?key=` in the request URL.

**Why it failed:** URL params are logged in server access logs, browser
history, and CDN caches.

**Replaced by:** The `x-goog-api-key` header. (Audit fix, 2026-03-29.)

## Auth error responses leaking server config

**Tried:** The `api/auth/google` catch block returned `hasClientId` and
`clientIdLength` in 401 responses.

**Why it failed:** Leaked whether the Google Client ID was configured and its
length — useful to an attacker probing the auth surface.

**Replaced by:** Generic error responses only.
