# Deploy — swe-interview-prep (Cloudflare Pages)

Production: **Vite SPA** + **Pages Functions** (`functions/`) + **Cloudflare D1**.

Software Wars also has a separately deployable Worker under
`workers/software-wars/` for the Tradeoff Durable Object and Queue consumer.
Repository code does not provision or deploy it automatically.

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
5. Apply pending D1 migrations through Wrangler only when the dispatch operator
   explicitly enables `apply_migrations` (off by default for code-only releases).
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
For a release that includes files under `migrations/d1/`, enable
`apply_migrations` when dispatching the workflow. For a local release, apply
tracked migrations before deploying:

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

## Software Wars activation

Follow [`runbooks/software-wars.md`](runbooks/software-wars.md). In short:

1. Validate content, migrations, tests, and the Worker configuration before
   changing platform state.
2. Provision the D1/R2/Queue/DLQ and SQLite Durable Object bindings declared in
   `workers/software-wars/wrangler.jsonc`; deploy the Worker manually.
3. Configure the Pages service binding, public Worker URL, shared signing
   secret, and optional RealtimeKit application/webhook credentials.
4. Apply `migrations/d1/0002_software_wars.sql` only through the explicit
   migration gate.
5. Enable unranked previews first. Enable ranked flags only after the content
   validator and a two-account smoke test pass.

Rollback starts by disabling match-creation flags. Pages and the Wars Worker
can then roll back independently. The migration is additive; completed history
and rating events are retained rather than destructively down-migrated.

## Post-deploy smoke

1. `/learn` — guest mode
2. Google sign-in — FSRS persists
3. Settings → Import — Anki upload (signed-in)
4. Progress → Weekly reality check
