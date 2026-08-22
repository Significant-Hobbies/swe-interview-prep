# Tasks

## Shipped locally, unreviewed

- [x] Triage logic and queue ordering (`src/lib/sweep.ts`)
- [x] Rating → FSRS mapping, with Known deliberately seeding nothing
- [x] `/sweep` route, domain picker, and rating runner (`src/pages/Sweep.tsx`)
- [x] Entry point on Learn (`src/pages/Learn.tsx`)
- [x] ROI ranking and hub matching (`src/lib/roi.ts`)
- [x] Source-hub index generator (`scripts/build-source-hubs.mjs`), chained
      into `sync:concept-packs`
- [x] `mutedTags` on `LearnerProfile`, client and server defaults
- [x] Mastery hooks report write failure; Sweep refuses to commit on rejection
- [x] Per-account sweep state with guest adoption
- [x] Hub landing pages curated and each verified 200
- [x] `verify-sources.mjs` extended to cover hub URLs
- [x] 45 tests across `sweep.test.ts` and `roi.test.ts`; `lint`, `typecheck`,
      295 tests, `docs:validate` green

## Fixed in review

- [x] Rating hotkeys firing on the domain picker (reproduced, then fixed by
      splitting picker and runner — hooks run before an early return)
- [x] Key auto-repeat mass-rating concepts
- [x] Rapid-keypress double-rate race
- [x] `mutedTags` discarded on first sign-in
- [x] `hbr.org` recommended as a "hub" for `behavioral`
- [x] Four hub labels misattributing or misdescribing their contents
- [x] Hub links opening one chapter of the work they name
- [x] `MIN_HUB_SHARE` having no test coverage
- [x] Hub coverage floor going silent as a domain nears completion
- [x] `runtime` tag collision handing an OS textbook to two WebGPU concepts
- [x] Dead pre-existing citation (Cormack RRF) surfaced by the extended verifier
- [x] Missing live region, low-contrast shortcut legend, undo shortcut unlabelled
- [x] Five dead exports removed

## Fixed after review (issue #79)

- [x] `weakConcepts()` replaced by `conceptGaps()` — untouched concepts are now
      reportable as gaps, so the blind spot named in the proposal is closed at
      the recommender rather than only at the Sweep ranking. Propagated to
      `/progress` and `/learn/all`, which label an uncovered concept
      `never opened` rather than "0% confident". Regression tests in
      `src/lib/recommend.test.ts` pass an empty mastery map on purpose — the
      old fixture gave every concept a row, which is why the bug survived.
- [x] Canonical docs home: `docs/product/breadth-sweep.md`

## Open

- [ ] Cross-device sync — needs approval before touching the schema:
  - [ ] `sweep_rating` table in `shared/db/schema.mjs`
  - [ ] Hand-mirrored copy in `functions/api/[[path]].js`
  - [ ] `handlers/sweep.mjs` (GET all, POST one) and registry entry
  - [ ] `useSweep` hook mirroring `useReviewMastery`, guest path preserved
- [ ] Decide whether Known should be spot-checked. It currently never
      resurfaces, so a wrong self-assessment is never caught; sampling ~10%
      would fix that but trades away the small-queue property.
- [ ] Decide whether `/sweep` earns a `SITE_NAV_ITEMS` entry, which costs a
      ~294-file curriculum regeneration.
