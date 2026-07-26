# STATUS — swe-interview-prep

Last updated: 2026-07-25

A short view of the current objective, active work, blockers, and next steps.
Detailed history and feature inventory live in
[`docs/knowledge/learnings.md`](docs/knowledge/learnings.md) and
[`docs/product/overview.md`](docs/product/overview.md). The fleet-format
project record is mirrored in [`PROJECT_STATUS.md`](PROJECT_STATUS.md).

## Current objective

**Maintenance-only.** Per the 2026-07-10 personal-use closure: keep SWE
Interview Prep available for direct use. Accept only maintenance,
reliability, or personally requested workflow fixes. No roadmap expansion,
no new backend providers, no alternate auth modes, no paid tiers, no team
workspaces.

## Active work

- **Sweep (`/sweep`) — personally requested breadth workflow, shipped
  locally, unreviewed.** A keyboard-driven triage pass over all 250
  concepts: read the `mentalModel`, rate Known / Fuzzy / New. Known records
  concept mastery but deliberately seeds **no** review cards; only Fuzzy and
  New enter the FSRS queue, which is what keeps the daily review cost small
  after a full pass. Reachable from Learn, intentionally **not** in global
  nav — see the note under Next steps. Logic in
  [`src/lib/sweep.ts`](src/lib/sweep.ts), page in
  [`src/pages/Sweep.tsx`](src/pages/Sweep.tsx), 19 tests in
  `src/lib/sweep.test.ts`.
- **ROI ranking — shipped locally, unreviewed.** Answers "where is my next
  hour worth most". The app could not do this before: `weakConcepts()`
  (`src/lib/recommend.ts:128`) filters on `mastery[c.id] && …`, so a concept
  never touched could never be reported as a gap, and every downstream
  surface inherited the blind spot. Sweep makes "not known" observable;
  [`src/lib/roi.ts`](src/lib/roi.ts) ranks domains by unknown-minus-thin
  (which now equals unknown, since nothing in the catalog is thin — see Next
  steps 3) and names the outside source covering the most of those gaps, from
  the hub index built by `pnpm build:source-hubs`. Interest is stored as
  `LearnerProfile.mutedTags` — a negative, because with broad interests
  ranking thirty domains yields "all of them" and no signal. No model and no
  LLM: it is set intersection over existing verified data.
- **DDIA widened across distributed systems.** The ranking reported "no hub"
  for `distributed-systems`, which turned out to be true: the catalog cited
  Designing Data-Intensive Applications on 3 concepts. Added to the four more
  it genuinely covers (`message-queues`, `cap-theorem`, `consensus`,
  `event-streaming-kafka`) in `scripts/s-tier-catalog.mjs`; the book now
  covers 6 of 11 and is the named source for the domain. Deliberately not
  added to `caching`, `messaging-realtime`, or `distributed-infra`, where it
  would be padding to manufacture a hub.
- The personally requested curriculum expansion and public SEO
  publication are complete: 18 tracks, 222 concepts, 24 roadmaps, and 265
  JavaScript-independent curriculum pages with exact sitemap and agent-catalog
  coverage. The homepage, application, and generated curriculum now also share
  one responsive navigation hierarchy without adding a backend dependency.

## Open access

**The app no longer asks anyone to sign in.** A visitor with no session is put
into guest mode and lands on `/today`; the `GoogleRequired` wrapper is gone and
`/sources`, `/session/:date`, and `/library` are open like everything else —
nothing they render was personal, so the gate only hid generated and vendored
content behind a login. `/login` survives as the pitch page, not a wall.

Signing in buys one thing: progress that outlives the browser. It sits in the
header, plus a strip that appears only once a guest has progress worth losing —
shown to a blank first visit it would be a third stacked banner and not even
true yet.

The only surface still owner-gated is the Reader adapter
(`GET /api/learning/reader`), which proxies a private token.

**No authenticated API fires without a session.** Six call sites were sending
auth-required requests regardless — most visibly `action=elo`, which 404'd on
every page load for anyone who never signed in. They now route through
`src/lib/learningApi.ts`, a single gate that reads the auth/public split from
`shared/api/learning-registry.mjs` so the client and server agree by
construction. Measured: a guest walking nine routes and rating three concepts
makes **zero** `/api/learning` calls, versus one 404 per page before.

Two dead paths surfaced while doing it. `getAuthToken()` has returned a hard
`null` since the JWT moved to an httpOnly cookie, and both `lib/activity.ts`
and `useCompanion` used it as their auth check — so activity logging had been
silently off for signed-in users too, not just guests. Both now gate on the
session and let the cookie carry auth.

## Sweep / ROI — 8-angle review outcome

**Fixed.** Hotkeys firing on the domain picker (the listener sat above the
early return, so pressing `1` on `/sweep` silently graded an unseen concept —
reproduced, then fixed by splitting the route into picker and runner);
no `event.repeat` guard (a held key rated ~50 concepts, undo recovers one);
a failed FSRS write still advancing the sweep (both mastery hooks now resolve
`false` on a rejected write, Sweep refuses to mark the concept triaged and
shows why — and `useConcepts`' catch now actually falls through to the local
scheduler, which its comment had claimed for some time while a `return` below
it prevented that); the rapid-keypress double-rate race (an in-flight guard,
verified with six back-to-back keypresses rating six distinct concepts);
`mutedTags` wiped on first sign-in; `hbr.org` winning `behavioral` as a "hub"
(now Google re:Work); four misattributing hub labels; 33 hub links pointing at
an arbitrary chapter (curated `HUB_URLS`, every entry fetched and confirmed
200 — zero chapter PDFs remain, guarded by a test); `MIN_HUB_SHARE` having
zero coverage (mutating it to 0 now fails); `aria-live` on the card swap,
legend contrast, `aria-keyshortcuts` on Undo; and five dead exports removed.

`verify-sources.mjs` now also checks hub landing pages — most are cited
nowhere else, so they were the one set of user-facing URLs nothing verified.
That immediately caught a dead pre-existing citation: the Cormack RRF paper on
`plg.uwaterloo.ca` no longer connects at all, replaced by its DOI after
confirming the CSL metadata names the same work. 649 sources, all resolving.

Sweep state is now namespaced per user (`swe-os:sweep-v1:<id>`), so a second
Google account on the same browser no longer opens a queue pre-answered with
the first account's ratings. Signing in adopts a guest pass and clears the
guest key, so the migration cannot itself become the leak. Persistence is
tested for the first time — vitest runs `environment: 'node'`, which has no
`localStorage`, so those assertions had been passing vacuously; the mock from
`userStore.test.ts` is now installed and three mutations (no-op save,
un-namespaced key, guest key left behind) each fail the suite.

**Still open.**

- **No cross-device sync for sweep state.** It is per-user but local-only, so
  a pass done on a laptop shows 0% on another machine and re-sweeping
  re-grades already-scheduled cards. Every sibling store syncs; this one has
  no server action. The cheapest route is probably folding `rated` into the
  existing `profile_json` blob rather than adding a table, but profile writes
  are whole-object PUTs, so it needs debouncing to survive a 250-rating pass.
That is the only remaining functional gap. It is specified but deliberately
unbuilt in
[`openspec/changes/2026-07-26-sweep-breadth-triage`](openspec/changes/2026-07-26-sweep-breadth-triage/),
written after the fact to close the missing-spec debt and to put the schema
change under review before it is made rather than after.

Two judgement calls are parked there for a decision: whether Known should be
spot-checked (it currently never resurfaces, so a wrong self-assessment is
never caught), and whether `/sweep` earns a `SITE_NAV_ITEMS` entry.

The "hub floor counts concepts, not distinct URLs" finding was investigated
and **rejected** — the rule would have deleted four legitimate single-URL hubs
(GoF, Goodfellow, Stat 110, Karpathy, each one book covering several concepts)
while keeping the bad case. The real defect was a tag collision:
`TAG_MEDIA.runtime` means OS execution, but the only concepts carrying
`runtime` are `ml-browser-runtime` and `ml-webgpu`, so two WebGPU concepts
were handed an operating-systems textbook — which padded OSTEP to four
concepts and made it recommendable. Fixed at the tag, and OSTEP now falls
below the hub floor, which is correct: it genuinely covers two concepts here.

## Blockers / known gaps

- **`.env.local` holds placeholder values, not real ones.** Its six keys were
  empty, which blocked `validate-env` at step 1/4; they now carry obvious
  dummies (`dummy-local-only-…`) so `pnpm ready` passes 4/4 locally. The file
  is gitignored and nothing dummy reaches a tracked file. Production is
  unaffected — the audit step reports Cloudflare Pages secrets present.
- **The signed-in path still cannot be exercised locally, and dummies do not
  change that.** Google Sign-In needs a real OAuth client ID, so a placeholder
  gets you a green build but no session. Every verification this cycle ran as a
  guest. Unit tests cover the pure logic — including mutation-tested proof for
  per-user sweep namespacing — but the sign-in flow, the server profile
  round-trip, and the write-failure banner have not been observed live. Doing
  so needs the real `VITE_GOOGLE_CLIENT_ID`.
- **`READER_API_TOKEN` not configured.** The private Reader adapter is
  built and tested but not activated in production. Activating it is a
  planned item — see
  [`docs/operations/runbooks/reader-adapter.md`](docs/operations/runbooks/reader-adapter.md).
- **End-to-end CI against live Turso + Cloudflare bindings is
  operator-dependent**, not fully automated in repo. The deploy workflow
  smokes the SPA + `/api/learning` after deploy but does not exercise the
  full DB-backed flow in CI.
- **JWT_SECRET rotation not yet performed.** The 2026-03-29 audit removed
  the hardcoded fallback; commit `26c3eb4` exposed the old secret in git
  history. Rotation is a known low-severity follow-up — see
  [`docs/operations/runbooks/rotate-jwt-secret.md`](docs/operations/runbooks/rotate-jwt-secret.md).
- **Some historical README/migration references** to the pre-Pages
  architecture remain in archived docs. They are explicitly marked stale
  and live under [`docs/archive/`](docs/archive/) — do not guide new work
  from them.

## Unresolved questions

- None open. (Personal-use closure resolved the roadmap-expansion question.)

## Next steps

1. **Use Sweep on one domain before deciding anything else about it.** Two
   follow-ups are deliberately unbuilt pending that:
   - *Global nav.* Promoting `/sweep` into `PRIMARY_NAV_ITEMS` or
     `BROWSE_NAV_ITEMS` is a one-line edit, but `SITE_NAV_ITEMS` is SSR'd
     into every generated curriculum page, so it also forces
     `pnpm generate:public-curriculum` and a ~294-file diff. Not worth
     spending on an unproven surface. `site-navigation.test.ts` also pins
     primary nav at six labels on purpose.
   - *Known spot-checks.* "Known" currently never resurfaces, so a wrong
     self-assessment is never caught. Sampling ~10% of Known concepts into
     review would fix that cheaply — but it trades away the small-queue
     property Sweep exists to protect, so it needs a real opinion first.
2. **`vector-db` still has no hub, and probably should not get one.** After
   widening the DDIA citations, 19 of 27 domains name an outside source;
   these 8 do not: `vector-db`, `system-design-cases`,
   `infrastructure-platforms`, `scalability`, `ann`, `indexing`,
   `systems-foundations`, `multimodal-spatial`. For `vector-db` the honest
   reason is that no *free, non-vendor* body of work covers it — the obvious
   candidates are all blocked by `scripts/source-tier.mjs` on purpose
   (`weaviate.io/blog`, `github.com/facebookresearch/faiss/wiki`,
   `ann-benchmarks.com`), and adding a vendor learning centre would reverse
   a deliberate standard. Leaving these as "no hub" is the correct output,
   not a gap to close.
3. **There is no thin-content problem — an earlier entry here claiming 57
   thin mental models was wrong.** The gate measured brevity (under 25
   words) rather than quality, and every one of the 57 turned out to be
   good, dense prose. Corrected in `isThinConcept` to check for absence,
   fragments, and generator boilerplate instead; `sweep.test.ts` now asserts
   the shipped catalog flags zero. Audited directly: 0 missing mental
   models, 0 that merely echo the description, 0 duplicates, 0 boilerplate
   stems, 0 under 12 words.
4. **`commonMistakes` is present on 115 of 250 concepts.** Unlike the above,
   this gap is real, but it is an enhancement rather than a defect — the
   field is optional and the mental models stand alone. Worth filling from
   sources for the builder domains, not worth generating.
5. Optional: run
   `pnpm docs:build` to preview the rendered docs site before publishing.
6. Optional: activate the Reader adapter by configuring `READER_API_TOKEN`
   (runbook linked above).
7. Optional: rotate `JWT_SECRET` (runbook linked above).

## Deferred (do not pursue unless personally requested)

- Vercel/serverless migration — stale; do not guide new work.
- Broad ATS, job boards, or application-tracking features.
- New backend providers or alternate auth modes.
- Paid tiers or team workspaces.
- Regression-test expansion beyond existing focused coverage.
