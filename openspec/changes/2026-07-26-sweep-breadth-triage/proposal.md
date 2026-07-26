# Sweep Breadth Triage and ROI Ranking

## Process note

The surface described below was **built before this proposal was written**,
which inverts the rule in the fleet `AGENTS.md` ("Use the `spec-driven` skill
before non-trivial new fleet features"). This document is written after the
fact to close that gap and, more usefully, to put the one remaining piece —
cross-device sync, which needs a schema change — under review *before* it is
built rather than after.

## Why

The owner's stated goal is breadth: enough working knowledge across
distributed systems, infrastructure, databases, and AI to recognise a problem
mid-build, know the trade-off, and know what to reach for. That goal is served
by coverage and retention, not by implementation practice.

Two things blocked it.

**The catalog had no fast traversal.** All 250 concepts carry a `mentalModel`
with a median of 37 words, so the whole interest surface is roughly a weekend
of reading — but the app had 38 routes and not one built for covering ground.

**The app could not say where effort was worth most.** `weakConcepts()`
(`src/lib/recommend.ts`) filters on `mastery[c.id] && …`, so a concept never
touched can never be reported as a gap. Every downstream surface inherited
that blind spot: the app could say you were shaky on something you had
studied, never that you had not opened distributed systems at all.

## What Changes

- Add a triage pass over the concept catalog: read the mental model, rate the
  concept Known / Fuzzy / New, resume where you left off.
- Seed only Fuzzy and New into the FSRS review queue. Known records concept
  mastery and is deliberately left out, because a queue holding all 250
  concepts is the failure mode the feature exists to prevent.
- Rank domains by the gaps the app can actually close, and name the single
  outside source covering most of them — including saying "no hub" when the
  catalog has nothing coherent to point at.
- Store declared interest as a negative (`mutedTags`). With broad interests,
  ranking thirty domains yields "all of them" and no signal; muting the few
  that do not matter states the truth in one interaction.

## Non-goals

- No implementation practice, graded labs, or new drill types.
- No LLM or model anywhere in the ranking — it is set intersection over
  already-verified data, so nothing inferred is written back into the catalog.
- No change to FSRS scheduling itself; Sweep is a new producer of ratings, not
  a new scheduler.
- No global navigation entry. `SITE_NAV_ITEMS` is server-rendered into ~294
  generated curriculum pages, so listing an unproven surface there costs a
  294-file regeneration.

## Impact

Adds one route (`/sweep`), one generator command (`build:source-hubs`), one
generated data file, and one optional profile field. Touches the two mastery
hooks — additively, to report write failure — and the Learn page, which gains
an entry point.

The remaining piece, **cross-device sync for sweep state**, is specified here
but deliberately not built: it needs a new table and a new API action, and
`functions/api/[[path]].js` mirrors the schema by hand. See `design.md`.
