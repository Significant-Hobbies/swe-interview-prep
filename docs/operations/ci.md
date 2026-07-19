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

## `deploy.yml` — manual only (`workflow_dispatch`)

Triggered only by `workflow_dispatch`; there is no push or PR trigger.

1. `pnpm test`
2. `pnpm validate:env:build` (with `VITE_GOOGLE_CLIENT_ID` from GitHub)
3. `pnpm build` (with `VITE_GOOGLE_CLIENT_ID` + `VITE_SAASMAKER_API_KEY`)
4. `rm -rf dist/wasm` — the 38MB Go WASM binary is hosted on R2, not Pages
   (see `.cfpagesignore`).
5. `wrangler pages deploy dist/ --project-name=swe-interview-prep` via
   `cloudflare/wrangler-action@v3`.
6. The workflow has `push`- and `pull_request`-gated steps (smoke
   `/api/learning?action=gaps` expecting 401/405/200; comment a preview URL),
   but because the workflow is dispatch-only, neither event fires — these
   steps are effectively inert.

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
