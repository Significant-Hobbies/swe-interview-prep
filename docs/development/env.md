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
| `VITE_API_URL` | Optional | Override the API base URL. Defaults to `http://localhost:3001` in dev, same-origin (`""`) in prod. |

## Runtime (Cloudflare Pages Functions, read at request time)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Yes | Server-side Google credential verification. |
| `JWT_SECRET` | Yes | Signs the `dsa_prep_auth` httpOnly cookie. **No fallback** — the audit removed `dev-secret-change-in-production`. |
| `TURSO_DATABASE_URL` | Yes | libSQL connection URL. |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token. |
| `READER_API_TOKEN` | Optional | Activates the private Reader adapter (owner-only). See [`../operations/runbooks/reader-adapter.md`](../operations/runbooks/reader-adapter.md). |

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
| Cloudflare Pages runtime secrets | `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `READER_API_TOKEN`. Sync via `pnpm sync:pages-secrets`. |

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
