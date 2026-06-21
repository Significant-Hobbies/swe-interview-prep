# Deploy — swe-interview-prep (Cloudflare Pages)

Production stack: **Vite SPA** on Cloudflare Pages + **Pages Functions** (`functions/api/[[path]].js`) + **Turso** + optional **Email Sending** + **cron digest**.

## Prerequisites

- Turso database created (`turso db create …`)
- Google OAuth client (Web) with authorized JavaScript origins including your Pages URL
- Cloudflare account with Pages project `swe-interview-prep`
- (Optional) Domain on Cloudflare for email sending

## 1. Required secrets (Pages → Settings → Environment variables)

Set these for **Production** (and Preview if you test auth there):

| Variable | Purpose |
|----------|---------|
| `TURSO_DATABASE_URL` | libSQL connection URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `JWT_SECRET` | Signs auth cookies (long random string) |
| `GOOGLE_CLIENT_ID` | Server-side Google token verify |
| `VITE_GOOGLE_CLIENT_ID` | Same client id — baked into SPA at build time |

Build-time only (also set in CI if using GitHub Actions):

```bash
pnpm validate:env:deploy   # checks required vars before build
pnpm build
```

## 2. Optional — daily digest email + browser push

| Variable | Purpose |
|----------|---------|
| `DIGEST_FROM_EMAIL` | From address (must be on a domain with Email Sending enabled) |
| `APP_URL` | Public app URL for links in digest (e.g. `https://swe-interview-prep.pages.dev`) |
| `VAPID_PUBLIC_KEY` | Web Push public key (server) |
| `VAPID_PRIVATE_KEY` | Web Push private key (server) |
| `VITE_VAPID_PUBLIC_KEY` | Same public key — SPA build |
| `VAPID_SUBJECT` | `mailto:you@yourdomain.com` |

### Email binding

`wrangler.toml` already declares:

```toml
[[send_email]]
name = "EMAIL"
```

Enable sending on your domain:

```bash
wrangler email sending enable yourdomain.com
```

Cron trigger (daily 13:00 UTC) is in `wrangler.toml` → `functions/scheduled.js`.

`pnpm validate:env:deploy` **warns** when digest/push vars are missing but does not block deploy.

## 3. Deploy commands

```bash
# From repo root
cp .env.example .env.local    # local dev only — never commit
pnpm install
pnpm validate:env:deploy
pnpm deploy                   # build + wrangler pages deploy
```

Or push to `main` if CI auto-deploys.

### Set secrets via CLI

```bash
wrangler pages secret put JWT_SECRET --project-name=swe-interview-prep
wrangler pages secret put TURSO_DATABASE_URL --project-name=swe-interview-prep
wrangler pages secret put TURSO_AUTH_TOKEN --project-name=swe-interview-prep
# … repeat for each secret
```

## 4. Local dev parity

```bash
cp .env.example .env.local   # fill Turso + JWT + Google
pnpm dev                     # Express :3456 (learning API) + Vite :5173
```

Vite proxies `/api/*` → `localhost:3456`. Learning routes mount via `shared/api/local-dev-routes.mjs`.

## 5. Post-deploy smoke

1. Open `/learn` — guest mode works without sign-in.
2. Google sign-in — profile + FSRS reviews persist.
3. Settings → Import & notify — Anki upload (signed-in).
4. Settings → enable email digest; cron runs daily (check Workers logs).
5. Progress → Weekly reality check — includes mock + Feynman stats when signed in.

## 6. Content ingest (offline, not runtime)

```bash
pnpm ingest-leetcode --list     # LeetCode drill stubs → drills.json
pnpm ingest-library-rqs         # library → review-questions-ingested.json
pnpm ingest-anki deck.apkg      # CLI preview of Anki parse
```

Commit generated JSON when you want new cards in production.