# Background Jobs

Offloading slow work to workers: scheduling, concurrency, visibility.

- Difficulty: core
- Tracks: Infrastructure & Platforms, Backend

## Mental model

Background jobs move slow work off the request so the user gets a fast response. The hard parts are idempotency (what if the job runs twice?), retries (transient errors vs permanent ones), and visibility (where did my job go?).



## Primary sources

- [Sidekiq — The Job lifecycle](https://github.com/sidekiq/sidekiq/wiki/Best-Practices) (doc)
- [Brandur Leach — Transactionally Staged Job Drains](https://brandur.org/job-drain) (doc)

## Practice

### At-least-once job delivery

Worker crashes after processing but before ACK. What happens on redelivery? How make handler safe?

**Expected evidence:** Duplicate delivery; handler must be idempotent or use dedupe keys.

## Review prompts

- A job worker dies mid-task. Why does at-least-once delivery follow, and what does that force on the job?

## Build evidence

- **Job queue with retries and DLQ** — A background job queue with backoff, jitter, and a dead-letter queue.
- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues)

## Related concepts

- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w)
