# swe-interview-prep docs

This is the canonical documentation tree for the repository. Start at
[`index.md`](index.md) for a full map of what lives where.

Agent-facing rules: [`../AGENTS.md`](../AGENTS.md). Current state:
[`../STATUS.md`](../STATUS.md).

## Note on `docs/learning/`

The `learning/` subdirectory is **product content**, not repo documentation.
`src/pages/LearningDoc.tsx` Vite-globs `docs/learning/*.md` at build time and
serves them at `/learning/:slug`. Do not move or rename those files — the
in-app routes depend on the slugs. Everything else under `docs/` is repo
documentation and is rendered by Blume as a presentation layer only.
