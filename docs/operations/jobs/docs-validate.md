# Job: Docs Validation (docs.yml)

Source of truth: `.github/workflows/docs.yml`. This page describes the
contract.

## Triggers

- Push or PR changing `docs/`, `scripts/validate-docs.mjs`,
  or `.github/workflows/docs.yml`.
- `workflow_dispatch`.

## What it does

1. `pnpm docs:validate` — `scripts/validate-docs.mjs` checks the `docs/` tree:
   required files present, no broken intra-doc markdown links, no empty
   placeholder docs, ADR index in sync with `architecture/decisions/`.
The committed Markdown in `docs/` is the source of truth. A failure here means
a doc references a file that does not exist, or the tree is missing a required
page.

## Local run

```bash
pnpm docs:validate
```

No install required — `validate-docs.mjs` is a plain Node script.
