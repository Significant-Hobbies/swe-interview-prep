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
`src/data/concept-pack-canons.json`. Chains into the source-hub index below,
which is derived from the packs and would otherwise go stale.

## Source hubs

```bash
pnpm build:source-hubs
```

`scripts/build-source-hubs.mjs` → `src/data/source-hubs.json`. Groups the
pack URLs into *hubs* — one coherent body of work (a course, a book, one
author's site) covering several concepts — so the ROI ranking can say "CMU
15-445 covers 10 of your 15 database gaps" instead of listing fifteen
separate lecture PDFs.

Two hand-curated lists live in the script and are the whole reason its output
is usable:

- **`PUBLISHERS`** — `arxiv.org` spans 95 concepts and `doi.org` 20, but "go
  read arxiv" is not a recommendation. Aggregators are excluded.
- **`PATH_SCOPED`** — `ocw.mit.edu` carries dozens of unrelated courses and
  `web.stanford.edu` hosts three separate books, so those group by path
  prefix rather than by host.

`HUB_LABELS` names the hubs, because the catalog titles the same source
several ways (Manning's IR book appears as three different titles), so no
prefix heuristic can recover one name.

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
