# Local Development Setup

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm (version pinned in `package.json` `packageManager`)
- For production deploys only: a Cloudflare account, a Turso database, and a
  Google OAuth client ID. **Local dev needs none of these.**

## First-time setup

```bash
pnpm install
cp .env.example .env.local      # fill VITE_GOOGLE_CLIENT_ID at minimum
pnpm validate:env:build         # confirm build-time env is present
pnpm validate:env:runtime       # confirm runtime env (optional for pure frontend dev)
pnpm dev                        # http://localhost:5173
```

`pnpm dev` runs Vite with the in-process AI bridge — no separate server, no
API keys. `/api/chat` streams your logged-in `claude`/`codex`/`gemini` CLI
over SSE. Pick a provider in Settings → AI (dev only).

## What runs in dev vs prod

| Path | Dev (`pnpm dev`) | Prod |
| --- | --- | --- |
| `/api/chat` | `vite-plugin-local-ai.js` streams CLIs | `functions/api/[[path]].js` → LLM providers |
| `/api/chats`, `/api/notes`, `/api/progress`, `/api/auth/*` | In-memory stubs | Pages Functions → Turso |
| `/api/learning`, `/api/go-run`, `/api/tag` | Legacy `api/*.mjs` handlers | Pages Functions → handlers/ |

The legacy `api/*.mjs` handlers are kept for local-dev parity. Production
runs only `functions/api/[[path]].js`. Both share `handlers/` and `shared/`.

## Env vars

See [`env.md`](env.md) for the full variable list and which are build-time vs
runtime. Build-time vars (`VITE_*`) are baked into the bundle; runtime vars
are read by the Pages Function at request time.

## Common commands

See [`commands.md`](commands.md) for the full `pnpm` script reference. The
short version:

```bash
pnpm dev          # Vite :5173 + in-process AI bridge
pnpm build        # validate env + vite build → dist/
pnpm test         # vitest run
pnpm test:e2e     # playwright
pnpm lint         # biome check .
pnpm typecheck    # tsc --noEmit
pnpm ready        # env + tests + build + secret audit (pre-deploy gate)
```

## Troubleshooting

- **`/api/chat` 401 in dev.** The dev bridge still requires auth for parity.
  Sign in via Google One Tap on localhost (add `http://localhost:5173` to
  your Google OAuth client's authorized origins).
- **Build fails on missing `VITE_GOOGLE_CLIENT_ID`.** Intentional — the SPA
  cannot render One Tap without it. Set it in `.env.local` (dev) or GitHub
  secret (CI/deploy).
- **`pnpm test:e2e` flaky.** Playwright needs a built app; run `pnpm build`
  first or use `pnpm dev` with the configured test server
  (`scripts/dev-e2e-server.mjs`).
