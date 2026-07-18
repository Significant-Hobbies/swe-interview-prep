# Job: Refresh Library (fetch-library.yml)

Source of truth: `.github/workflows/fetch-library.yml`. This page describes
the contract.

## Schedule

`cron: '0 6 * * 1'` — Mondays 06:00 UTC. Also `workflow_dispatch`.

## What it does

1. Checkout, Node 22, pnpm from `package.json` `packageManager`.
2. `pnpm install --frozen-lockfile`.
3. `pnpm fetch-library` — clones/refreshes each repo in
   `scripts/library.config.json`, normalizes, rebuilds review-question
   indexes, formats output. See
   [`../../development/content-pipelines.md`](../../development/content-pipelines.md).
4. If `git diff --quiet -- src/data/library` → exit (no changes).
5. Otherwise: `git add src/data/library`, commit
   `chore(library): weekly refresh`, push.

Permissions: `contents: write`. Timeout: 30 minutes.

## When it breaks

- An upstream repo is renamed, archived, or restructured. The generator
  retains the previous generated source for that repo instead of silently
  dropping it (stale-on-failure contract). Inspect the manifest count delta
  in the action log.
- The commit/push fails (e.g. branch protection). The job fails loudly;
  re-run after resolving the protection rule.

## Manual run

```bash
pnpm fetch-library
# inspect: git status src/data/library
pnpm test && pnpm build   # verify generated content
git add src/data/library
git commit -m "chore(library): manual refresh"
```

Do not hand-edit files under `src/data/library/` — change
`scripts/library.config.json` and re-run the generator.
