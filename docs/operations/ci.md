# CI

Source of truth: `.github/workflows/*.yml`. This page describes the contracts.

## `ci.yml` — every push to `main`/`master` and every PR

Runs on ubuntu-latest, Node 22, pnpm (from `package.json` `packageManager`).

1. `pnpm install --frozen-lockfile --ignore-scripts`
2. `pnpm lint` (Biome)
3. `pnpm test` (Vitest)
4. `pnpm build` with `VITE_GOOGLE_CLIENT_ID=ci-placeholder.apps.googleusercontent.com`
5. `pnpm run size` (bundle budget from `.size-limit.json`)

`--ignore-scripts` skips postinstall scripts; the build is what matters in CI.

## `deploy.yml` — manual (`workflow_dispatch`) and on push to `main`

1. `pnpm test`
2. `pnpm validate:env:build` (with `VITE_GOOGLE_CLIENT_ID` from GitHub)
3. `pnpm build` (with `VITE_GOOGLE_CLIENT_ID` + `VITE_SAASMAKER_API_KEY`)
4. `rm -rf dist/wasm` — the 38MB Go WASM binary is hosted on R2, not Pages
   (see `.cfpagesignore`).
5. `wrangler pages deploy dist/ --project-name=swe-interview-prep` via
   `cloudflare/wrangler-action@v3`.
6. On push: smoke `https://learn.significanthobbies.com` and
   `/api/learning?action=gaps` (expects 401/405/200).
7. On PR: comment the preview URL.

Required GitHub secrets/variables: `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`, `VITE_GOOGLE_CLIENT_ID`, optional
`VITE_SAASMAKER_API_KEY`. See [`deploy.md`](deploy.md).

## `weekly.yml` — Mondays 09:00 UTC (`workflow_dispatch`)

Runs lint → typecheck → test → build with a placeholder client ID. A
"quality snapshot" — fails are visible but do not block deploys. Auto-detects
the package manager.

## `fetch-library.yml` — Mondays 06:00 UTC (`workflow_dispatch`)

Refreshes the embedded library and commits changes if any. See
[`jobs/library-refresh.md`](jobs/library-refresh.md).

## `docs.yml` — docs validation

Runs on push/PR when `docs/`, `blume.config.ts`, or `scripts/validate-docs.mjs`
change. Validates the docs tree (required files, broken internal links) and,
when Blume is configured, runs `blume validate` over internal links. See
[`jobs/docs-validate.md`](jobs/docs-validate.md).

## Dependabot

`.github/dependabot.yml` keeps dependencies current. Renovate config is at
`renovate.json` (config-only; not currently active in CI).
