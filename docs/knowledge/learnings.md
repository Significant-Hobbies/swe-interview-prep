# Durable Learnings

Reusable lessons that are not obvious from the code. Add new entries at the
top with a date. One lesson per bullet; link to the code or ADR that
exemplifies it.

## 2026-07 — Personal-use closure changes the maintenance posture

The 2026-07-10 closure (see [`../../STATUS.md`](../../STATUS.md)) means this
product is maintenance-only. New work must be either reliability, a
personally-requested workflow fix, or a doc change. Do not propose roadmap
expansion. The `plans/2026-05-29-cognitive-fitness-roadmap.md` items are
paused candidates, not active planned work (archived under
[`../archive/plans/`](../archive/plans/)).

## 2026-06 — A dev-only Vite plugin beats a submodule for dev affordances

Replacing the `local-ai` git submodule with `vite-plugin-local-ai.js`
(`apply: 'serve'`) removed a second process, a proxy hop, and a submodule
ref to keep in sync — and it cannot ship to prod because `apply: 'serve'`
excludes it from `vite build`. See
[`../architecture/decisions/0006-dev-ai-bridge-inprocess.md`](../architecture/decisions/0006-dev-ai-bridge-inprocess.md).
Generalize: for any dev-only affordance, prefer an in-process Vite plugin
over a sidecar server.

## 2026-04 — The loop closes only when mastery feeds the next pick

The drill → Feynman Gate → FSRS → "next weakest concept" card loop only works
because every stage writes to `concept_mastery` and the dashboard reads from
the same table. A loop that stores review state separately from the
recommender will drift. See
[`../architecture/decisions/0004-fsrs-spaced-repetition.md`](../architecture/decisions/0004-fsrs-spaced-repetition.md).

## 2026-03 — Serverless schema needs additive-only changes

There is no migration runner; `initDatabase()` runs `CREATE TABLE IF NOT
EXISTS` on first cold start. Any schema change that would require an
`ALTER TABLE` on existing rows must instead be additive (new column with a
default, new table). Source of truth: `shared/db/schema.mjs`, mirrored by
hand in `functions/api/[[path]].js`.

## 2026-03 — Reference-only beats copy for external content

The learning-sources registry and the embedded library both avoid copying
canonical source bodies. Copying creates a second source of truth that
drifts and creates licensing risk. Index by metadata; fetch bodies at
request time through authenticated proxies. See ADRs
[0007](../architecture/decisions/0007-unified-learning-sources-registry.md)
and [0008](../architecture/decisions/0008-embedded-learning-library.md).

## 2026-03 — Stale-on-failure is the right default for external feeds

Both the High Signal adapter and the library generator retain the last-good
output on upstream failure instead of dropping content or inventing it. This
keeps the user-facing surface stable during transient outages and makes
failures visible (a `stale` marker) without breaking the loop.
