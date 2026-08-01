# Deploy — swe-interview-prep (Cloudflare Pages)

Production: **Vite SPA** + **Pages Functions** (`functions/`) + **Cloudflare D1**.

## One-command readiness

```bash
cp .env.example .env.local   # fill once
pnpm ready                   # env + tests + build + secret audit
```

Sync auth runtime secrets to Cloudflare (first time or rotation):

```bash
pnpm sync:pages-secrets
```

## Deploy workflow (manual)

Deploys are **manual**. [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
is triggered only by `workflow_dispatch` — there is no push-to-`main` trigger.
Pushes to `main` run `ci.yml` (tests/lint/build) and, on doc changes,
`docs.yml`, but do not deploy. Full CI matrix: [`ci.md`](ci.md).

When dispatched, `deploy.yml`:

1. `pnpm test`
2. Validate build environment and the production D1 `DB` binding.
3. `pnpm build` (with `VITE_GOOGLE_CLIENT_ID` from GitHub).
4. Remove the R2-hosted WASM artifact from `dist/`.
5. Apply pending D1 migrations through Wrangler.
6. `wrangler pages deploy dist/ --project-name=swe-interview-prep`.
7. Smoke the SPA and `/api/learning?action=gaps`.

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
| `JWT_SECRET` | Auth cookie signing |
| `GOOGLE_CLIENT_ID` | Server Google verify |

The relational database is the non-secret `DB` D1 binding in `wrangler.toml`.
Apply tracked migrations before deploying:

```bash
pnpm db:migrate:remote
```

See [`runbooks/migrate-turso-to-d1.md`](runbooks/migrate-turso-to-d1.md) for
the one-time cutover and rollback procedure.

Google OAuth client must list your Pages origin (e.g. `https://learn.significanthobbies.com`).

### Manual deploy

```bash
pnpm deploy
```

## Local dev

```bash
cp .env.example .env.local
pnpm dev    # Vite :5173 (AI bridge runs in-process — no separate server)
```

To exercise the real Pages Functions with isolated local D1 instead of the
in-memory Vite stubs, run `pnpm db:migrate:local` and `pnpm dev:pages`.

See [`../development/setup.md`](../development/setup.md) for full local setup.

## Post-deploy smoke

1. `/learn` — guest mode
2. Google sign-in — FSRS persists
3. Settings → Import — Anki upload (signed-in)
4. Progress → Weekly reality check
