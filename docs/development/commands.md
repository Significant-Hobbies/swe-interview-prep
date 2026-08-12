# Commands

Source of truth: `package.json` `scripts`. This page annotates the
non-obvious ones. If it disagrees with `package.json`, `package.json` wins.

## Daily

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server on `:5173` with the in-process AI bridge (`vite-plugin-local-ai.js`, `apply: 'serve'`). |
| `pnpm dev:frontend` | Alias for `pnpm dev`. |
| `pnpm build` | `validate-env.mjs build` then `vite build → dist/`. Fails fast on missing build env. |
| `pnpm preview` | `vite preview` — serve the last build locally. |
| `pnpm test` | `vitest run` (unit). |
| `pnpm test:watch` | `vitest` in watch mode. |
| `pnpm test:coverage` | `vitest run --coverage`. |
| `pnpm test:e2e` | `playwright test` (e2e in `tests/e2e/`). |
| `pnpm lint` | `biome check .` |
| `pnpm format` | `biome format --write .` |
| `pnpm format:check` | `biome format .` (no writes). |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm size` | `size-limit` (bundle budget; config in `.size-limit.json`). |
| `pnpm validate:wars-content` | Validate ranked content, variants, sources, launch thresholds, and precomputed AI coverage. |
| `pnpm audit:wars-topic -- <topic>` | Run the focused 100-question editorial contract for one Wars topic before activation. |
| `pnpm dev:wars-worker` | Run the local Tradeoff Durable Object and Queue Worker. |
| `pnpm quality` | Full CI gate: format, lint, types, whole-source coverage, unused code, complexity, duplication, cycles, dependency advisories, suppressions, docs, build, bundle size, and repository hygiene. |

The `quality:*` scripts in `package.json` are individual code-health checks.
Their checked-in values are non-regression ratchets: improvements should lower
the corresponding baseline in `scripts/check-code-health.mjs`; new debt fails.

The Wars validator enforces 1,200 active reviewed Blitz questions—100 per
topic with the required difficulty split—20 active reviewed Tradeoff problems,
and complete stored answer coverage for every published AI profile. It also
checks canonical concept links, option-specific explanations, duplicate and
near-duplicate content, source breadth, and answer-position balance. The
browser's unranked preview is a separate, disclosed sample and never enters
ranked selection.

Focused Systems Lab checks:

```bash
pnpm exec vitest run \
  src/lib/simulation/engine.test.ts \
  src/lib/simulation/configuration.test.ts \
  src/lib/simulation/replay.test.ts \
  src/data/systems-labs/systems-labs.test.ts \
  src/lib/systemsLabAttempts.test.ts
pnpm typecheck
```

The focused suite proves definition reachability, broken-to-repaired
configuration challenges, byte-identical replay, versioned replay import
validation, pinned source contracts, mutation detection, scenario outcomes,
and the local prediction/attempt contract. It does not replace the full
`pnpm test`, lint, build, and docs gates.

## Env + deploy gates

| Command | What it does |
| --- | --- |
| `pnpm validate:env:build` | Confirm build-time env (`VITE_GOOGLE_CLIENT_ID`) is present. |
| `pnpm validate:env:runtime` | Confirm runtime secrets (JWT, Google) — for local full-stack dev. |
| `pnpm validate:env:deploy` | Strictest gate; used by `pnpm deploy` and the deploy workflow. Only prints missing names, never values. |
| `pnpm validate:d1:deploy` | Reject a deploy unless `wrangler.toml` has a real production `DB` UUID. |
| `pnpm db:migrate:local` | Apply tracked migrations to isolated local D1. |
| `pnpm dev:pages` | Build, migrate local D1, and run Pages Functions locally. |
| `pnpm ready` | `check-ready.mjs` — env + tests + build + secret audit. Run before a deploy. |
| `pnpm sync:pages-secrets` | `sync-pages-secrets.mjs` — push runtime secrets to Cloudflare Pages (first time or rotation). |
| `pnpm deploy` | Env + D1 binding validation, build, remote migrations, then `wrangler pages deploy dist/ --project-name=swe-interview-prep`. |

## Content pipelines

See [`content-pipelines.md`](content-pipelines.md) for what each does and
when to run it. The short list:

| Command | Purpose |
| --- | --- |
| `pnpm fetch-library` | Refresh the embedded GitHub library → `src/data/library/`. |
| `pnpm build-concept-index` | Rebuild `src/data/library/concept-index.json`. |
| `pnpm sync:external-resources` | Harvest + bootstrap external resources. |
| `pnpm sync:concept-packs` | Generate concept packs. |
| `pnpm sync:learning-sources` | Rebuild the learning-sources registry. |
| `pnpm ingest-library-rqs` | Ingest library review questions. |
| `pnpm ingest-anki` | Ingest an Anki export. |
| `pnpm ingest-leetcode` | Ingest LeetCode problems. |
| `pnpm link-leetcode-drills` | Link LeetCode problems to drills. |

## Docs

| Command | Purpose |
| --- | --- |
| `pnpm docs:validate` | Validate the `docs/` tree (required files, broken internal links, structure). |
| `pnpm docs:build` | Build the Blume docs site into `dist-docs/` (presentation layer only). |
| `pnpm docs:preview` | Preview the Blume docs site locally. |
| `pnpm docs:check` | `blume check` — type-check the Blume site (requires Blume installed). |

`docs:build` / `docs:preview` / `docs:check` require `blume` to be installed
(`pnpm add -D blume` or `npx blume`). The committed Markdown in `docs/` is
the source of truth; Blume is only the presentation and search layer.
