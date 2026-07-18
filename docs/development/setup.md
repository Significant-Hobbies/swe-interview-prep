# Local Development Setup

## Prerequisites

- Node.js: `.nvmrc` pins `20.18.0`; CI and the deploy workflow run on Node 22.
  Either works — 20.18.0+ is the floor.
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

Production runs **only** `functions/api/[[path]].js`, which serves a small
route set. The `api/*.mjs` handlers are dev/legacy only and are not deployed.

| Path | Dev (`pnpm dev`) | Prod (`functions/api/[[path]].js`) |
| --- | --- | --- |
| `/api/chat` | `vite-plugin-local-ai.js` streams CLIs | Not served (client still calls it) |
| `/api/chats`, `/api/notes` | In-memory Vite stubs | Not served |
| `/api/progress`, `/api/auth/*` | In-memory Vite stubs | Pages Function → Turso |
| `/api/learning?action=…` | Legacy `api/learning.mjs` → `handlers/` | Pages Function → `handlers/` (via `shared/`) |
| `/api/learning/reader`, `/api/ai` | (dev stubs / static) | Pages Function |
| `/api/go-run` | Legacy `api/go-run.mjs` → go.dev proxy | Not served (Go falls back to client WASM) |

`tag` is a `/api/learning?action=tag` action, not a top-level `/api/tag`
route. The `api/*.mjs` handlers and the Pages Function both share `handlers/`
and `shared/`.

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

- **AI companion needs sign-in in dev.** The dev bridge's `/api/chat`
  endpoint does not auth-gate the stream, but the app gates the companion UI
  behind sign-in. Sign in via Google One Tap on localhost (add
  `http://localhost:5173` to your Google OAuth client's authorized origins).
  The dev bridge's `/api/auth/verify` always returns 401, so use guest mode
  or a real Google login as needed.
- **Build fails on missing `VITE_GOOGLE_CLIENT_ID`.** Intentional — the SPA
  cannot render One Tap without it. Set it in `.env.local` (dev) or GitHub
  secret (CI/deploy).
- **`pnpm test:e2e` flaky.** Playwright needs a built app; run `pnpm build`
  first or use `pnpm dev` with the configured test server
  (`scripts/dev-e2e-server.mjs`).
