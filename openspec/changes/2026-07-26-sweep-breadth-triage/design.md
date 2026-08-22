# Design

## Rating semantics

Sweep ratings are self-assessment, not recall performance, so they map onto the
FSRS grade that produces the interval the claim deserves:

| Sweep | FSRS | Seeds review cards |
| --- | --- | --- |
| Known | `easy` | **No** |
| Fuzzy | `hard` | Yes |
| New to me | `again` | Yes |

Known deliberately seeds nothing. Concept mastery still moves, so the claim is
recorded, but seeding cards for every concept already known is the flood the
feature exists to prevent. A wrong self-assessment surfaces through a drill or
a roadmap, and the concept can be re-swept.

## Why the ranking needed Sweep first

`isUnknown` treats an untouched concept as a gap. That is only meaningful
because triage makes "not known" observable — before Sweep, absence of mastery
was indistinguishable from absence of interest, which is why `weakConcepts()`
had to filter untouched concepts out and why no surface could rank domains.

## Source hubs

A hub is one coherent body of work covering three or more concepts, derived
from `concept-packs.json` by host, with two corrections found in the data:

- **Publishers are excluded.** `arxiv.org` spans 95 concepts and `doi.org` 20,
  but "go read arxiv" is not a recommendation.
- **Some hosts carry many unrelated works** and are grouped by path prefix —
  `ocw.mit.edu` spans dozens of courses; `web.stanford.edu` hosts three
  separate books.

Labels and landing-page URLs are hand-curated. Both halves are necessary and
were learned separately: curating only the label produced cards reading
"Google SRE Book covers 11 of them" that opened the Being On-Call chapter,
because the derived URL is the shortest link in the group and the group rarely
cites a root.

The coverage floor adapts to how much is left. A flat "covers at least 3"
reads right for an untriaged 20-concept domain and is wrong for one with three
gaps: measured across the catalog, domains with a hub fell from 72% to 38% as
concepts were marked Known, because the overlap count shrinks faster than the
share rises. The floor never drops below 2 — recommending a whole book to
close one concept is worse than the concept's own reading list.

## Deferred: cross-device sync

Sweep state is per-user (`swe-os:sweep-v1:<id>`) but local only. Every sibling
store syncs; this one has no server action, so a pass done on a laptop shows
0% elsewhere and re-sweeping re-grades already-scheduled cards.

Two options were considered.

**Fold `rated` into `profile_json`.** No schema change, and the profile already
round-trips. Rejected: profile writes are whole-object PUTs merged against a
possibly-stale local copy, so a 250-rating pass would need debouncing and could
clobber `roadmapWeights` or `trackIds` on a bad interleave. The blast radius of
a mistake covers settings the user depends on.

**A dedicated table and action, mirroring `concept_mastery`.** Preferred. Writes
are per-concept upserts, matching how mastery and review-mastery already work,
and a failure cannot corrupt unrelated state. Costs a `CREATE TABLE IF NOT
EXISTS` in `shared/db/schema.mjs`, a hand-mirrored copy in
`functions/api/[[path]].js`, a handler, a registry entry, and a hook.

The second is the right shape, and it is the reason this proposal exists before
the code rather than after: it is a schema change plus a new API capability on
a product whose status is maintenance-only, and it should be approved rather
than assumed.
