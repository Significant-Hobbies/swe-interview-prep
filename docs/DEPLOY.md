# Deploy — swe-interview-prep (Cloudflare Pages)

Production: **Vite SPA** + **Pages Functions** (`functions/`) + **Turso**.

## One-command readiness

```bash
cp .env.example .env.local   # fill once
pnpm ready                   # env + tests + build + secret audit
```

Sync runtime secrets to Cloudflare (first time or rotation):

```bash
pnpm sync:pages-secrets
```

## Auto-deploy (default)

Pushes to `main` trigger [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. `pnpm test`
2. `pnpm build` (with `VITE_GOOGLE_CLIENT_ID` from GitHub)
3. `wrangler pages deploy dist/ --project-name=swe-interview-prep`
4. Smoke SPA + `/api/learning` Functions

**GitHub** (Settings → Secrets and variables):

| Name | Type | Purpose |
|------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Secret | Wrangler deploy (Pages Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Variable | From Cloudflare dashboard |
| `VITE_GOOGLE_CLIENT_ID` | Secret | Baked into SPA at build |
| `VITE_SAASMAKER_API_KEY` | Secret | Feedback widget (optional) |

**Cloudflare Pages secrets** (runtime — set via `pnpm sync:pages-secrets`):

| Variable | Purpose |
|----------|---------|
| `TURSO_DATABASE_URL` | libSQL URL |
| `TURSO_AUTH_TOKEN` | Turso token |
| `JWT_SECRET` | Auth cookie signing |
| `GOOGLE_CLIENT_ID` | Server Google verify |

Google OAuth client must list your Pages origin (e.g. `https://swe-interview-prep.pages.dev`).

### Manual deploy

```bash
pnpm deploy
```

## Local dev

```bash
cp .env.example .env.local
pnpm dev    # Vite :5173 (AI bridge runs in-process — no separate server)
```

## Post-deploy smoke

1. `/learn` — guest mode
2. Google sign-in — FSRS persists
3. Settings → Import — Anki upload (signed-in)
4. Progress → Weekly reality check