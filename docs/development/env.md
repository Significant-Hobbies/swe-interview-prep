# Environment Variables

Source of truth: `.env.example`, `scripts/validate-env.mjs`, and the deploy
workflow (`.github/workflows/deploy.yml`). This page annotates which are
build-time vs runtime and where each is consumed. If it disagrees with
`.env.example` or the validator, those win.

## Build-time (Vite, baked into the SPA bundle)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google One Tap client ID. The SPA cannot render auth without it. `pnpm build` fails if missing. |
| `VITE_SAASMAKER_API_KEY` | Optional | SaaS Maker feedback widget. |
| `VITE_API_URL` | Optional | Override the API base URL. `src/lib/api-url.ts` defaults it to `""` (same-origin) when unset — dev and prod alike. (The `.env.example` comment's `http://localhost:3001` default is stale.) |

## Runtime (Cloudflare Pages Functions, read at request time)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Yes | Server-side Google credential verification. |
| `JWT_SECRET` | Yes | Signs the `dsa_prep_auth` httpOnly cookie. **No fallback** — the audit removed `dev-secret-change-in-production`. |
| `READER_API_TOKEN` | Optional | Activates the private Reader adapter (owner-only). See [`../operations/runbooks/reader-adapter.md`](../operations/runbooks/reader-adapter.md). |

The database is a Cloudflare Pages D1 binding named `DB`, declared in Wrangler
config rather than an environment variable or secret.

## Software Wars runtime configuration

The Pages deployment and separate Wars Worker use these names. Configure
values and credentials manually in Cloudflare; none belong in tracked files.

| Name | Kind | Purpose |
| --- | --- | --- |
| `WARS_ENABLED` | Non-secret flag | Master match-creation gate. |
| `WARS_BLITZ_PREVIEW_ENABLED`, `WARS_BLITZ_RANKED_ENABLED` | Non-secret flags | Enable unranked and ranked Blitz independently. |
| `WARS_TRADEOFF_PREVIEW_ENABLED`, `WARS_TRADEOFF_RANKED_ENABLED` | Non-secret flags | Enable unranked and ranked Tradeoff independently. |
| `WARS_REALTIME_PUBLIC_URL` | Non-secret URL | Public WebSocket endpoint for the Wars Worker. |
| `REALTIMEKIT_ACCOUNT_ID`, `REALTIMEKIT_APP_ID` | Non-secret identifiers | Select the RealtimeKit application. |
| `REALTIMEKIT_API_TOKEN` | Secret | Creates meetings and participant-scoped credentials. |
| `REALTIMEKIT_WEBHOOK_PUBLIC_KEY` | Secret/runtime verification material | Verifies signed provider webhook bodies. |
| `WARS_REALTIME_SIGNING_SECRET` | Secret | Signs five-minute match-scoped control-plane tokens shared by Pages and the Worker. |

Pages requires `DB`, `WAR_ARTIFACTS` (R2), `WAR_JOBS` (Queue), and a
`WARS_REALTIME` service binding. The Wars Worker declares D1, R2, Queue, DLQ,
and SQLite Durable Object bindings in `workers/software-wars/wrangler.jsonc`.
RealtimeKit is optional: without its account/app/token values, artifact, phase,
and voting flows remain usable with a clear media-disabled state.

## AI provider fallbacks (runtime, optional)

The client can pass `aiConfig: {endpointUrl, apiKey, model}` per request. If
omitted, the server falls back to:

| Variable | Purpose |
| --- | --- |
| `AI_ENDPOINT_URL` | Default AI endpoint. |
| `AI_API_KEY` | Default AI key. |
| `AI_MODEL` | Default model name. |

Dev does not need these — the in-process Vite AI bridge streams the logged-in
CLIs with no keys.

## Where each is set

| Surface | Variables |
| --- | --- |
| `.env.local` (gitignored) | Local dev: `VITE_*` and any runtime vars for full-stack local. |
| GitHub Secrets/Variables | `VITE_GOOGLE_CLIENT_ID`, `VITE_SAASMAKER_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. |
| Cloudflare Pages runtime secrets | `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `READER_API_TOKEN`. Sync the required auth secrets via `pnpm sync:pages-secrets`; D1 is the `DB` binding. |

## Validation

```bash
pnpm validate:env:build      # build-time contract
pnpm validate:env:runtime    # runtime contract (local full-stack)
pnpm validate:env:deploy     # strictest; used by pnpm deploy + CI
```

The validator only prints missing variable **names**, never values. The
deploy workflow additionally checks that Cloudflare Pages has the required
runtime secrets configured before deploying.

## Safety

- `.env.local` is gitignored via `*.local`. Never commit it.
- `.env.example` contains only placeholder values — safe.
- The Husky `pre-push` hook scans tracked files for common secret patterns
  and aborts the push if any are found (see `.husky/pre-push`).
