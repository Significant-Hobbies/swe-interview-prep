# Software Wars Operations

Use this runbook for launch gating, content reports, provider incidents, queue
backlogs, cost containment, rating corrections, and rollback. Never paste
secret values into commands, issues, or logs.

## Pre-launch gate

1. Run `pnpm validate:wars-content`, focused Wars tests, typecheck, lint, docs
   validation, and the production build.
2. Verify `0002_software_wars.sql` against a disposable local D1 database.
3. Dry-run `workers/software-wars/wrangler.jsonc`.
4. With ranked flags off, run a two-account Tradeoff smoke: check-in,
   simultaneous twist, artifact freeze/reveal, debate, private vote, reconnect,
   and result. Test RealtimeKit only after backend credentials and the signed
   webhook are configured.
5. Enable preview flags. Inspect abandonment, media errors, Queue retries, and
   storage growth before enabling ranked creation.

## Content report review

`pnpm validate:wars-content` is the ranked-content gate. It requires 1,200
distinct active base questions: 100 in each of 12 topics, with exactly 30
foundation, 45 intermediate, and 25 advanced questions per topic. Every option
must include authored reasoning. Generated variants are reported separately and
never increase the base count. The same report requires complete stored-answer
coverage for all three AI opponents (3,600 answers for the base bank).

The automated gate verifies structure, canonical primary-concept and supporting
concept references, per-topic source breadth, answer-position balance, exact
and near duplicates, repeated option sets or explanations, and rejected
templated prose. It records machine review evidence; it does not replace
editorial review. Candidate
questions remain `reviewed`, rather than `active`, until an independent audit
checks factual correctness, distractor quality, and source-to-claim alignment.

Treat `war_content_reports` as an operator queue. Reproduce against the exact
content version and cited source. Dismiss unsupported reports with a note;
otherwise retire that version so it cannot enter new matches. Do not rewrite a
completed snapshot. If an invalid item changed ranked outcomes, use a
compensating rating event rather than editing or deleting the original event.

## Rating correction

Keep the original rating event immutable. A correction references the event it
compensates, records before/after rating and algorithm version, and uses a
unique operator operation ID. Recompute the user's current rating from the
event sequence and record the report or incident authorizing the correction.
Never issue an unexplained direct overwrite.

## RealtimeKit outage

Leave the game-state Worker running. The room must show media unavailable while
WebSocket phases, artifacts, and voting continue. Stop creating provider rooms
through platform configuration, not tracked credentials. Resume only after
participant-token refresh and signed webhook delivery pass a private smoke.

## Queue backlog or evaluator outage

Pause new ranked Tradeoff creation first; Blitz does not require asynchronous
adjudication. Inspect pending/failed `war_queue_jobs`, Queue and DLQ depth,
oldest job age, and the last error code. Retries are idempotent by operation ID.
Do not replay a completed job or bypass schema validation. Exhausted
adjudications stay unrated in `review_required`.

## Cost containment

Keep video recording off. Copy only mutually consented transcripts, enforce
size and retention limits, and expire project-owned transcript objects on
schedule. Create RealtimeKit meetings near check-in, never at scheduling time.
AI opponents are precomputed; Blitz performs no match-time model inference.

## Rollback

Disable all Wars creation flags first. Existing sanitized public results and
immutable history may remain readable. Roll back Pages and the Wars Worker
independently, retaining service bindings until active rooms drain. Do not drop
the additive tables, delete rating events, or remove evidence needed by an
unfinished evaluation.
