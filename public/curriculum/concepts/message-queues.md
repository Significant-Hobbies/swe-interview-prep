# Message Queues

Kafka, SQS, exactly-once vs at-least-once.

- Difficulty: core
- Tracks: Distributed Systems, Backend

## Mental model

A queue decouples producer speed from consumer speed and turns a sync call into a durable, retryable message. 'Exactly once' is mostly a myth — design for at-least-once delivery plus idempotent consumers.

## Where it matters

Kafka, SQS, RabbitMQ; ingestion and event pipelines.

## Common mistakes

- Assuming exactly-once delivery
- Non-idempotent consumers on an at-least-once queue
- Ignoring ordering guarantees (or their absence)

## Primary sources

- [Message queue (Wikipedia)](https://en.wikipedia.org/wiki/Message_queue) (doc)
- [Apache Kafka documentation](https://kafka.apache.org/documentation/) (doc)

## Practice

### Queue backpressure

Producer 10k msg/s, consumer 2k msg/s. Queue depth grows 8k/s. When shed load — at depth 50k or consumer lag 60s?

**Expected evidence:** Alert on lag and depth; shed at SLA breach; scale consumers or throttle producer.

## Review prompts

- Why is 'exactly-once' delivery usually a myth, and what do you do instead?

## Build evidence

- **Job queue with retries and DLQ** — A background job queue with backoff, jitter, and a dead-letter queue.
- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq)
- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w)
