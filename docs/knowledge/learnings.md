# Durable Learnings

Reusable lessons that are not obvious from the code. Add new entries at the
top with a date. One lesson per bullet; link to the code or ADR that
exemplifies it.

## 2026-08 — Choose the concept before the learning format

New papers and calculators are tempting because they are novel, but novelty is
not a learning priority. Choose recovery, retention, or progression from
learner state first; only then select the best fitting evidence action for the
winning concept. This keeps a fresh source from displacing failed practice or
an overdue review, and makes “why today?” inspectable.

The daily paper choice may rotate deterministically for variety, but only
inside that concept-first boundary. Mutable continuity and durable evidence
also need different stores: a draft may be overwritten while typing and
ignored when a definition version changes, while a decision receipt or paper
attempt is append-only. Keeping them separate avoids turning resume behavior
into accidental mastery history.

## 2026-08 — Calculations become learning only through decisions and explanation

A numeric result is useful evidence, not mastery. Freeze a prediction before
reveal, preserve assumptions and derived values in an immutable receipt, then
require a mitigation, counterfactual, verification metric, and causal
explain-back. Keep opened, calculated, retrieved, pending, and verified states
separate so UI completion cannot fabricate FSRS progress.
## 2026-08 — A truthiness filter can make absence unreportable

`weakConcepts()` filtered on `mastery[c.id] && …`, so a concept never opened
could not be reported as a gap at any surface — and the product's goal is
coverage, which is exactly a statement about absence. The tell was a passing
test whose fixture gave every concept a mastery row, so the blind spot was
invisible to it. Generalize: when a record's *absence* carries meaning, a
truthiness guard silently deletes that meaning, and a fixture where every key
is present will never catch it. Fix and reasoning:
[`breadth-sweep.md`](../product/breadth-sweep.md).

## 2026-08 — Learning actions are Fetch handlers, not Express

Production already authenticates in the Pages Function and
`dispatchLearningAction`. The Express `(req, res)` adapter was leftover from
Vercel — handlers now take `{ request, user, json }` and return `json(...)`.
Do not reintroduce a second Express dispatcher for `/api/learning`.

## 2026-07 — Broad curriculum coverage needs a machine-readable contract

Track names alone cannot prove that a broad learning taxonomy is actually
covered. The eleven-domain expansion keeps the 96 requested subtopics in
`src/data/curriculum-coverage.json`, maps each to stable concept IDs, and tests
that the mappings resolve. Existing lessons are reclassified instead of
duplicated so FSRS mastery remains attached to one canonical card. New lessons
are accepted only when they have a source, drill, review prompt, roadmap
placement, and synthesis artifact.

## 2026-07 — Personal-use closure changes the maintenance posture

The 2026-07-10 closure (see [`STATUS.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/STATUS.md)) means this
product is maintenance-only. New work must be either reliability, a
personally requested change, or a doc change. Do not autonomously propose
roadmap expansion. The `plans/2026-05-29-cognitive-fitness-roadmap.md` items
remain paused candidates, not active planned work (archived under
[`archive/plans/`](https://github.com/Significant-Hobbies/swe-interview-prep/tree/main/docs/archive/plans)).

## 2026-06 — A dev-only Vite plugin beats a submodule for dev affordances

Replacing the `local-ai` git submodule with `vite-plugin-local-ai.js`
(`apply: 'serve'`) removed a second process, a proxy hop, and a submodule
ref to keep in sync — and it cannot ship to prod because `apply: 'serve'`
excludes it from `vite build`. See
[`0006-dev-ai-bridge-inprocess.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0006-dev-ai-bridge-inprocess.md).
Generalize: for any dev-only affordance, prefer an in-process Vite plugin
over a sidecar server.

## 2026-04 — The loop closes only when mastery feeds the next pick

The drill → Feynman Gate → FSRS → "next weakest concept" card loop only works
because every stage writes to `concept_mastery` and the dashboard reads from
the same table. A loop that stores review state separately from the
recommender will drift. See
[`0004-fsrs-spaced-repetition.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0004-fsrs-spaced-repetition.md).

## 2026-08 — Serverless schema needs deterministic migrations

Request-time `CREATE TABLE IF NOT EXISTS` duplicated schema and hid deployment
ordering. D1 migrations under `migrations/d1/` now form one source of truth and
must be applied before traffic moves. Schema changes remain additive and
backwards-compatible; request handlers never perform DDL.

## 2026-03 — Reference-only beats copy for external content

The learning-sources registry and the embedded library both avoid copying
canonical source bodies. Copying creates a second source of truth that
drifts and creates licensing risk. Index by metadata; fetch bodies at
request time through authenticated proxies. See ADRs
[0007](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0007-unified-learning-sources-registry.md)
and [0008](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0008-embedded-learning-library.md).

## 2026-03 — Stale-on-failure is the right default for external feeds

Both the High Signal adapter and the library generator retain the last-good
output on upstream failure instead of dropping content or inventing it. This
keeps the user-facing surface stable during transient outages and makes
failures visible (a `stale` marker) without breaking the loop.
