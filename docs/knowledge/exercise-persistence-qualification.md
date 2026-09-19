# Exercise persistence qualification — 2026-09-07

The source repair fixes two reproducible resume defects in the drill workspace:
changing the drill route retained the previous exercise's draft, and saved code
arriving after mount never replaced the initial starter. Each drill now owns a
separate workspace instance; an untouched editor follows saved progress until
the learner edits, including an intentional empty draft.

## Executable evidence

`src/pages/BuildLab.persistence.test.tsx` mounts the real BuildLab React route,
real authored `build-tokenizer` test cases, real TypeScript drill grader and
real local drill-store hook.

- The starter/wrong implementation cannot be marked solved or write completion.
- The authored reference implementation passes actual tests, stores solved
  status/code/one attempt, and restores them after unmount/remount.
- Navigating to another real drill clears the previous exercise's draft.
- Delayed account code fills an untouched editor, while an edited empty buffer
  remains empty when the same response arrives later.

The last two cases fail on the original source and pass on the repair. The
complete local `pnpm quality` gate passes: 598 tests across 93 files, coverage
floors, code health, docs, production build and bundle-size checks. The final
act-environment test setting was checked with the three interaction tests.

## Limits and retained tasks

This DOM harness substitutes a textarea for Monaco, mocks authentication and
hosted read responses, and stubs mastery/AI/activity side effects. It exercises
real grading and local persistence, not the actual browser editor, Google
login, D1 writes or the full explain-back flow. No existing learner data was
read or changed, and no deployment occurred.

- [#97: live exercise/account qualification](https://github.com/Significant-Hobbies/swe-interview-prep/issues/97)
  retains the fresh guest, mobile, Monaco and hosted persistence gates.

## Account record sync repair (#98)

The generic drill, artifact, and project stores persist account-scoped data and
stable pending operation IDs before sending requests. Controllers survive route
unmounts, serialize writes, retain pending edits over GET reconciliation, and
retry on mount, reconnect, or explicit retry. Account switching hides old
records/drafts, aborts old requests, and the handlers reject mismatched account
IDs for both reads and writes. Older unscoped records remain guest-local.

`handlers/record-sync.integration.test.mjs` uses the real store, three real
handlers, D1 adapter, and isolated native SQLite with the real migrations.
It proves failed POST retention through controller reconstruction (reload),
lost-response retry with exactly one drill attempt/activity row, delayed POST
serialization, stale GET rejection, browser storage failure/retry, and account
isolation. Artifact/project retries leave one receipt. The native SQLite D1
binding substitute implements transaction commit/rollback. An injected activity
write failure proves the drill update and receipt both roll back, then retry
creates exactly one attempt. It is not a hosted
Cloudflare execution receipt. Import preparation preserves operation receipts.

`RecordSyncStatus.test.tsx` mounts the actual hooks, account boundary and status
UI. It exercises pending → failed → online retry → synced, and hides Alice’s
code after switching to Bob or guest. These are DOM tests with synthetic
authentication and network responses, not a Google account browser login.

The new `0003_record_sync_receipts.sql` must be applied before deploying. No
remote migration or deployment occurred. This repair qualifies one active tab;
concurrent-tab and cross-device conflict resolution and other stores
(notes/mastery/ELO) remain outside its contract — the record-store replay
coverage added later is in the 2026-09-19 section below. #97 retains hosted
workflow qualification.

Validation: full `pnpm quality` passed 607 tests across 95 files; the final
transaction rollback addition passed with all 11 handler/import tests.

## Concurrent-tab and cross-device replay — 2026-09-19 (#97 source phase)

Auditing the #98 contract against #97 found one real gap: `persist()` wrote the
whole `{data, pending}` envelope, so a second tab's save overwrote the first
tab's undelivered operations. An edit queued offline in a tab that then closed
before flushing was silently dropped from the outbox. `persist()` now merges
instead of overwriting: it adopts unknown pending operations by `operationId`,
defers to the stored copy for records this tab never touched, and reapplies the
records this tab authored or adopted from the server. A `seen` set of known
operation IDs keeps acknowledged operations from resurrecting out of a stale
envelope, so a deduplicated retry cannot double-count attempts or activity.

`handlers/record-sync.integration.test.mjs` replays the cases against the real
drill/artifact/project handlers and native SQLite with the real migrations:

- A tab closing with an undelivered write no longer loses it — the surviving
  tab adopts the pending operation and delivers it on reconnect; a later reload
  inherits a clean envelope and rehydrates both records from the server.
- Two tabs writing the same record produce one attempt per queued operation,
  one receipt per operation, and converge to the last committed write.
- Two devices (separate storage maps) merge through the server: each device
  picks up the other's committed record on its next reconcile.
- A write in flight during sign-out still commits under the original account;
  the retained pending retry is a receipt-deduplicated no-op, and the second
  account sees and owns nothing.

`src/components/FeynmanGate.test.tsx` proves the explain-back unavailability
contract at source level: a failed grading request reports the failure, leaves
the drafted explanation in the open gate, and issues no mastery write.

Residual limits, honestly stated: simultaneous same-millisecond persists from
two tabs can still interleave (localStorage has no compare-and-swap), adopted
operations wait for the adopting tab's next flush, and cross-device freshness
is reconcile-driven rather than live. Truly overlapping read/merge/write calls
can still lose a queued operation; the sequential replay tests do not prove
atomic cross-tab persistence. This remains an open qualification gap. Failed
storage writes now leave adopted operations eligible for retry, covered by a
regression that failed before the repair. Notes, concept mastery,
review-question mastery, and ELO remain
fire-and-forget stores outside the receipt/outbox contract.

### Migration order and rollback

`0003_record_sync_receipts.sql` is additive (`CREATE TABLE IF NOT EXISTS`) and
must be applied **before** the code deploys: without the table, every receipted
write fails inside `recordSync.commit` and the client parks work as `failed`.
Deploy-then-migrate is therefore the broken order; migrate-then-deploy and
migrate-only are both safe. Rolling the code back is safe with the table in
place — pre-receipt handlers never reference it. Do not drop the table while
receipted code is deployed. The hosted gate remains owner-approved: apply via
`pnpm db:migrate:remote` (or the deploy workflow's `apply_migrations` gate),
then deploy, then run the browser handoff script recorded in issue #97.

Validation: `pnpm quality` — 967 tests across 119 files, coverage floors,
lint/typecheck, code-health ratchets, docs validation, production build, and
bundle-size limits all pass. The build was verified with a placeholder
`VITE_GOOGLE_CLIENT_ID` because this worktree has no `.env.local`; no real
credential was used or needed. No remote migration or deployment occurred.

## Hosted guest checkpoint — 2026-09-08

An isolated Chrome context at `https://learn.significanthobbies.com` started
with no learning evidence and a visible Sign in link. The Dashboard's
"Build a search tokenizer" link opened the real Monaco drill editor.
Keyboard selection and typing were used; no editor model or saved state was
injected. The generic fill tool could not edit Monaco, but click, Select All,
and keyboard typing worked.

- The starter remained unsolved with `tokenize is not defined`.
- A function returning an empty array remained unsolved with an explicit
  expected-versus-actual test failure.
- A lowercase/split/stop-word/suffix implementation passed the authored tests
  and became `solved · 1 attempts`.
- The post-solve prompt explicitly required sign-in for explain-back grading
  and concept mastery; it did not claim guest mastery.
- Reload restored the submitted code and solved status. Running again passed.
- A 390 × 844 mobile/touch viewport retained readable controls and wrapped
  code, with document width and scroll width both 390. Its screenshot was
  visually inspected. This is browser emulation, not physical-phone keyboard
  or Safari qualification.

These observations cover the existing production deployment
`8f1a01ef-0492-4415-8261-24f162685ba3`, source prefix `3687863`, as reported by
Cloudflare Pages. They do not qualify the pending sync repair. A read-only
remote migration check found only `0003_record_sync_receipts.sql` pending.
The deploy guard rejected the latest library-refresh source `4b0f613` because
it has no push CI run. A checked documentation follow-up must obtain current
push CI before the existing deployment workflow can apply the additive
migration and release the repair. No migration or deployment occurred during
this checkpoint; authenticated D1, account isolation, and lost-ack retries
remain open in #97.
