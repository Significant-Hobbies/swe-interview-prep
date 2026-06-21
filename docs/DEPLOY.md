# Deploy — swe-interview-prep (Cloudflare Pages)

Production: **Vite SPA** + **Pages Functions** (`functions/`) + **Turso**.

## Auto-deploy (default)

Pushes to `main` trigger [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. `pnpm build` (with `VITE_GOOGLE_CLIENT_ID` from GitHub)
2. `wrangler pages deploy dist/ --project-name=swe-interview-prep`
3. Smoke `curl` against production

**GitHub repo secrets** (Settings → Secrets):

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Wrangler deploy (Pages Edit permission) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account id |
| `VITE_GOOGLE_CLIENT_ID` | Baked into SPA at build time |

**Cloudflare Pages secrets** (runtime — API/auth/DB):

```bash
wrangler pages secret put JWT_SECRET --project-name=swe-interview-prep
wrangler pages secret put TURSO_DATABASE_URL --project-name=swe-interview-prep
wrangler pages secret put TURSO_AUTH_TOKEN --project-name=swe-interview-prep
wrangler pages secret put GOOGLE_CLIENT_ID --project-name=swe-interview-prep
```

Set once in the dashboard or via CLI; they persist across auto-deploys.

### Manual deploy

```bash
pnpm validate:env:deploy   # checks required vars locally
pnpm deploy              # build + wrangler pages deploy
```

## Required env

| Variable | Where | Purpose |
|----------|-------|---------|
| `TURSO_DATABASE_URL` | Pages secret | libSQL URL |
| `TURSO_AUTH_TOKEN` | Pages secret | Turso token |
| `JWT_SECRET` | Pages secret | Auth cookie signing |
| `GOOGLE_CLIENT_ID` | Pages secret | Server Google verify |
| `VITE_GOOGLE_CLIENT_ID` | GitHub secret / local build | Same id in SPA |

Google OAuth client must list your Pages origin (e.g. `https://swe-interview-prep.pages.dev`).

## Local dev

```bash
cp .env.example .env.local
pnpm dev    # Express :3456 + Vite :5173
```

## Post-deploy smoke

1. `/learn` — guest mode
2. Google sign-in — FSRS persists
3. Settings → Import — Anki upload (signed-in)
4. Progress → Weekly reality check