# Testing

## Unit tests — Vitest

```bash
pnpm test              # vitest run
pnpm test:watch        # vitest (watch)
pnpm test:coverage     # vitest run --coverage
```

Config: `vitest.config.ts`. DOM environment: `happy-dom`. Coverage output:
`coverage/` (gitignored).

Collocated tests live next to their source: `*.test.ts` / `*.test.tsx` in
`src/lib/`, `src/hooks/`, `src/data/`, `src/pages/`, and `shared/lib/`. The
shared-library parity tests (`shared/api/parity.test.mjs`) verify that the
legacy `api/` handlers and the production `functions/` handlers agree.

## E2E tests — Playwright

```bash
pnpm test:e2e
```

Config: `playwright.config.ts`. Tests in `tests/e2e/`. Playwright needs a
running app — use `scripts/dev-e2e-server.mjs` or run against `pnpm preview`
after a build. Artifacts (`test-results/`, `playwright-report/`,
`playwright/.cache/`) are gitignored.

## Lint / format / typecheck

```bash
pnpm lint          # biome check .
pnpm format        # biome format --write .
pnpm typecheck     # tsc --noEmit
```

Biome config: `biome.json`. TypeScript is `strict: true` (see `tsconfig.json`).

## Bundle size

```bash
pnpm size          # size-limit (config: .size-limit.json)
pnpm size:check    # size-limit --json
```

The CI workflow runs `pnpm run size` after the build.

## Pre-commit / pre-push

- Husky `pre-push` (`.husky/pre-push`): runs `pnpm lint` if defined, then a
  secret-pattern scan over tracked files. Aborts the push on either failure.
- There is no `pre-commit` hook installed by default (`.husky/_/pre-commit`
  is the husky scaffold, not a project hook).

## CI

See [`../operations/ci.md`](../operations/ci.md) for what runs on every push
and PR. The short version: lint → test → build (with a placeholder
`VITE_GOOGLE_CLIENT_ID`) → bundle-size check.

## Known gaps

- End-to-end CI against live Turso + Cloudflare bindings is
  operator-dependent, not fully automated in repo (see
  [`../../STATUS.md`](../../STATUS.md)).
- Regression coverage is "paused" at the existing focused coverage per the
  personal-use closure.
