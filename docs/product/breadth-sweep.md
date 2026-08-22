# Breadth Sweep

Scope: the breadth layer — the triage pass at `/sweep`, the ROI ranking it
feeds, and the coverage gaps the rest of the app reports. This page records
what was built and why, including the parts that were deliberately not built.
Route inventory lives in [`surfaces.md`](surfaces.md); the source-hub generator
is documented in
[`content-pipelines.md`](../development/content-pipelines.md#source-hubs);
code remains authoritative for behaviour.

## Why a breadth layer exists

The owner's goal for this product is breadth: enough working knowledge across
distributed systems, infrastructure, databases, and AI to recognise a problem
mid-build, know the trade-off, and know what to reach for. That goal is served
by **coverage and retention**, not by implementation practice — which is the
one thing the rest of the app was already good at (see
[`overview.md`](overview.md), *Core principle*).

Two things blocked it.

**The catalogue had no fast traversal.** Every concept carries a `mentalModel`
of a few dozen words, so reading the whole interest surface is roughly a
weekend — a realistic goal rather than an aspiration. But no surface was built
for covering ground; every one of them was built for going deep on one thing.

**The app could not say where effort was worth most.** The recommender filtered
on `mastery[c.id] && …`, so a concept never touched could not be reported as a
gap. It could say you were shaky on something you had studied, never that you
had not opened distributed systems at all.

## What was built

| Piece | Role |
| --- | --- |
| `/sweep` route (`src/pages/Sweep.tsx`) | Domain picker plus a keyboard rating runner |
| `src/lib/sweep.ts` | Pure triage logic: queue order, coverage, rating → writes |
| `src/lib/roi.ts` | Domain ranking and hub matching over sweep state |
| `scripts/build-source-hubs.mjs` | Derives `src/data/source-hubs.json` from the concept packs |
| `mutedTags` on `LearnerProfile` | Declared interest, stored as a negative |
| `src/lib/recommend.ts` → `conceptGaps()` | The coverage-gap fix, consumed by Progress and Browse |

`/sweep` is reachable from `/learn` and is deliberately absent from
`SITE_NAV_ITEMS`, because that list is server-rendered into the generated
curriculum pages and adding an entry costs a full regeneration of them.

## Rating semantics

A sweep rating is self-assessment, not recall performance, so each one maps
onto the FSRS grade that produces the interval the claim deserves. FSRS itself
is unchanged — Sweep is a new *producer* of ratings, not a new scheduler (see
[ADR 0004](../architecture/decisions/0004-fsrs-spaced-repetition.md)).

| Sweep rating | FSRS grade | Seeds review cards |
| --- | --- | --- |
| Known | `easy` | **No** |
| Fuzzy | `hard` | Yes |
| New to me | `again` | Yes |

Known seeding nothing is the load-bearing decision. Concept mastery still
moves, so the claim is recorded and the ranking can use it, but seeding cards
for every concept already known produces a queue holding the entire catalogue
— the exact failure this feature exists to prevent. The accepted cost is that a
wrong self-assessment is never re-tested by the queue; it surfaces through a
drill or a roadmap instead, and the concept can be re-swept. Whether Known
should be spot-checked at a low sampling rate is an open question, tracked in
[GitHub Issues](https://github.com/Significant-Hobbies/swe-interview-prep/issues).

Interest is stored as a **negative**. With genuinely broad interests, asking
the learner to rank thirty domains yields "all of them" and no signal; muting
the few that do not matter states the same thing truthfully in one interaction.

## Coverage gaps: both kinds of thin

`conceptGaps()` in `src/lib/recommend.ts` replaced `weakConcepts()`, which
could only report concepts that already had a mastery row. It now returns two
kinds of gap:

- **shaky** — studied, but FSRS confidence is under the bar. Decaying now.
- **uncovered** — no mastery row at all. Never opened.

Shaky is reported first because it is time-sensitive; uncovered has been at
zero for as long as the catalogue has existed and keeps until tomorrow. Within
the uncovered group the order is the same one a triage pass would use —
foundations before frontier, then editorial priority — so the two surfaces
agree about what to do next.

Gaps are deliberately **not** filtered by prerequisite reachability. Prereq
gating reads mastery, so for a learner who has touched nothing every
prerequisite is unmet and every gap would be filtered back out — the same blind
spot arriving by a second route. `pickNextConcept()` is the function that owes
the learner a reachable next step; `conceptGaps()` owes them the truth about
coverage.

Surfaces that consume it:

| Surface | What it shows |
| --- | --- |
| `/progress` | "Biggest gaps" — three thinnest concepts, labelled `never opened` when uncovered |
| `/learn/all` | "Biggest gaps" panel — four cards; uncovered cards offer *Read* rather than *Review* |
| `/sweep` | Domain ranking, which counts an untouched concept as unknown by construction |

The distinction has to reach the UI, not just the data: a concept never opened
renders as `never opened` rather than as "0% confident", because the second
implies a measurement that was never taken.

## Ranking and outside sources

`rankDomains()` orders domains by the gaps this app can actually close —
unknown concepts minus the ones whose mental model is too thin to learn from —
excluding muted domains, and flags a domain whose figure is an untriaged upper
bound rather than a measurement.

For each domain it names at most one outside source: the single coherent body
of work covering the most of that domain's remaining gaps, or nothing at all.
Being able to say "no hub" is the point — it exposes content debt instead of
hiding it behind a bad suggestion. The floors that make that possible, and the
publisher exclusions and path-scoped hosts that make the hub index usable, are
documented with the generator in
[`content-pipelines.md`](../development/content-pipelines.md#source-hubs).

No model and no LLM appears anywhere in the ranking. It is set intersection
over already-verified catalogue data and the learner's own sweep state, so
nothing inferred is ever written back into the catalogue.

## Storage and privacy

Sweep state lives in `localStorage` under `swe-os:sweep-v1:<user-id>`, one key
per account. Signing in **adopts** a guest pass rather than discarding it, and
clears the guest key once adopted — so an hour of anonymous triage is not lost
at the moment of login, and the next account to sign in on the same browser
does not inherit the previous one's ratings.

A rating is committed only once the writes it implies have landed. If a mastery
write is rejected, the concept stays in the queue, nothing is recorded, and the
failure is shown; the mastery hooks were extended additively to report write
failure for exactly this.

## Not built: cross-device sync

Sweep state is the only store here with no server round-trip, so a pass done on
a laptop shows 0% elsewhere, and re-sweeping re-grades already-scheduled cards.
This is a known limitation, not an oversight.

Closing it requires a new table, a hand-mirrored copy of the schema in
`functions/api/[[path]].js`, a handler, a registry entry, and a hook. That is a
schema change plus a new API capability on a product whose status is
maintenance-only, so it is **specified and awaiting owner approval rather than
built**. The cheaper alternative — folding ratings into `profile_json` — was
considered and rejected: profile writes are whole-object PUTs merged against a
possibly-stale local copy, so a 250-rating pass could clobber unrelated
settings. The full comparison is in the
[change design](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/openspec/changes/2026-07-26-sweep-breadth-triage/design.md).

## Process note

This surface was built *before* its proposal was written, which inverts the
rule that a spec precedes a non-trivial feature. The
[spec-driven change](https://github.com/Significant-Hobbies/swe-interview-prep/tree/main/openspec/changes/2026-07-26-sweep-breadth-triage)
and its
[tracking issue](https://github.com/Significant-Hobbies/swe-interview-prep/issues/79)
were written afterwards to close that gap; this page is its home in the
canonical docs tree, where a reader looking for the product's breadth model
will actually find it.

The useful half of writing a spec after the fact is what it forced into the
open. Two decisions were still unmade — cross-device sync and whether Known
should be spot-checked — and the first is a schema change. Writing them down
put them under review *before* they were built, which is the value the rule was
protecting in the first place. The remaining open items are tracked in
[GitHub Issues](https://github.com/Significant-Hobbies/swe-interview-prep/issues),
not here.

## Related

- [`surfaces.md`](surfaces.md) — route and API inventory
- [`content-pipelines.md`](../development/content-pipelines.md#source-hubs) — how the hub index is generated
- [ADR 0004](../architecture/decisions/0004-fsrs-spaced-repetition.md) — why FSRS owns scheduling
- [`learnings.md`](../knowledge/learnings.md) — the reusable lesson behind the coverage fix
