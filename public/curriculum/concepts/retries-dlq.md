# Retries & DLQ

Backoff + jitter, poison messages, dead-letter queues.

- Difficulty: core
- Tracks: Infrastructure & Platforms, Backend

## Mental model

Retries fix transient failures; backoff with jitter stops a retry storm; a dead-letter queue catches messages that will never succeed so they stop blocking the queue and become debuggable. Scope: this card owns one mechanism, queue-side: poison messages, the dead-letter queue, and getting a stuck consumer moving again. Caller-side backoff, jitter and breakers are `retries-and-circuit-breakers`; the reasoning about ambiguous failure is `distributed-failure-recovery`.

## Where it matters

SQS/Kafka consumers, every background job system.

## Common mistakes

- Retrying without backoff and creating a thundering herd
- Retrying without jitter so all clients sync up
- No DLQ, so one poison message stalls the pipeline
- Retrying non-idempotent work and causing double effects

## Primary sources

- [Timeouts, retries and backoff with jitter (AWS)](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) (article)

## Practice

### Implement backoff with jitter

Implement exponential backoff with full jitter for a retry loop, and route a message to a DLQ after N failed attempts.

**Expected evidence:** Retry delays that grow exponentially and are randomized; poison messages land in a DLQ.

## Review prompts

- What problem does a dead-letter queue solve?
- Why add jitter to retry backoff?

## Build evidence

- **Job queue with retries and DLQ** — A background job queue with backoff, jitter, and a dead-letter queue.
- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html)

## Related concepts

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues.html)
- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w.html)
