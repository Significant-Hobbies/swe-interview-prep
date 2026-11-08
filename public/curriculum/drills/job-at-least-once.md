# At-least-once job delivery

> Worker crashes after processing but before ACK. What happens on redelivery? How make handler safe?

Canonical: https://learn.significanthobbies.com/curriculum/drills/job-at-least-once

Worker crashes after processing but before ACK. What happens on redelivery? How make handler safe?

## The mechanism

Background jobs move slow work off the request so the user gets a fast response. The hard parts are idempotency (what if the job runs twice?), retries (transient errors vs permanent ones), and visibility (where did my job go?).

## Expected evidence

Duplicate delivery; handler must be idempotent or use dedupe keys.

## Hints

- ACK after side effects = loss risk.
- ACK before = duplicate risk.

## Sources and practice

- [Sidekiq — The Job lifecycle](https://github.com/sidekiq/sidekiq/wiki/Best-Practices)
- [Brandur Leach — Transactionally Staged Job Drains](https://brandur.org/job-drain)
- [Study Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/job-at-least-once)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
