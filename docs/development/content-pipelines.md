# Content Pipelines

The `scripts/` directory contains the build-time content generators that
produce the static JSON the SPA loads. Generated output lives under
`src/data/` and is committed (so deploys don't depend on network). The
generators are the only way to change generated content — never hand-edit
generated files.

## Embedded learning library

```bash
pnpm fetch-library
```

Runs `scripts/fetch-library.mjs` (clone/refresh each repo from
`scripts/library.config.json`, normalize hierarchy, rewrite media refs,
rebuild review-question indexes, record refresh metadata) →
`build-concept-index.mjs` → `ingest-library-rqs.mjs` → `biome format` the
output. Output: `src/data/library/` (per-repo dirs + `manifest.json` +
`concept-index.json`).

- Config: `scripts/library.config.json` (the inclusion list + per-repo
  adapter). Inclusion standard and current sources: see
  [`../product/learning-library.md`](../product/learning-library.md).
- A failed or empty upstream parse **retains the previous generated source**
  instead of silently dropping it.
- Automated refresh: the `fetch-library.yml` workflow runs this every Monday
  06:00 UTC and commits changes — see
  [`../operations/jobs/library-refresh.md`](../operations/jobs/library-refresh.md).
- Temp dir `.tmp-library/` is gitignored.

## Learning-sources registry

```bash
pnpm sync:learning-sources
```

Runs `scripts/sync-learning-sources.mjs` (uses `--experimental-strip-types`).
Indexes the active Fleet project study queues (all fleet projects except the
`EXCLUDED_PROJECTS` set in the script), research paths, the High Signal feed,
and the Reader adapter into `src/data/learning-sources.json`.
Reference-only — does not copy source bodies. See
[`0007-unified-learning-sources-registry.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0007-unified-learning-sources-registry.md).

- `FLEET_ROOT` env var overrides the fleet root (defaults to `../`).
- Excludes a fixed set of inactive projects (see script).
- High Signal feed sync lives in `scripts/lib/high-signal-learning.mjs`.

## External resources

```bash
pnpm sync:external-resources
```

`scripts/harvest-external-resources.mjs` → `scripts/bootstrap-external-resources.mjs`.
Produces `src/data/external-resources.json` and
`src/data/curated-external-resources.json`.

## Concept packs

```bash
pnpm sync:concept-packs
```

`scripts/generate-concept-packs.mjs` → `src/data/concept-packs.json` and
`src/data/concept-pack-canons.json`.

## Ingesters (run on demand)

| Command | Source | Output |
| --- | --- | --- |
| `pnpm ingest-anki` | Anki export | FSRS deck data |
| `pnpm ingest-leetcode` | LeetCode API | Problem JSON |
| `pnpm link-leetcode-drills` | Existing problems | Drill ↔ LeetCode links |
| `pnpm ingest-library-rqs` | Library content | `review-questions-ingested.json` |

## Concept index

```bash
pnpm build-concept-index
```

`scripts/build-concept-index.mjs` rebuilds `src/data/library/concept-index.json`.
Also run as part of `pnpm fetch-library`.

## Validation helpers

| Command | Purpose |
| --- | --- |
| `pnpm validate:env:build` / `:runtime` / `:deploy` | `scripts/validate-env.mjs` — env contracts. |
| `pnpm ready` | `scripts/check-ready.mjs` — pre-deploy gate. |
| `pnpm sync:pages-secrets` | `scripts/sync-pages-secrets.mjs` — push runtime secrets to Cloudflare. |

## Editing generated content

Never. Change the config (`scripts/library.config.json`,
`scripts/sync-learning-sources.mjs` project list, etc.) and re-run the
generator. The `fetch-library.yml` job is the canonical refresh path; manual
runs are fine for one-off fixes but commit the result.
