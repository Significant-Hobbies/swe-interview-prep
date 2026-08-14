# Event Streaming & Kafka

Partitioned logs, producers, consumer groups, offsets, ordering, delivery semantics, backpressure, and stream processing.

- Difficulty: core
- Tracks: Distributed Systems

## Mental model

Kafka turns an append-only log into a coordination boundary. Ordering is per partition, progress is an offset, and consumers own replay and idempotency.



## Primary sources

- [Kafka: a Distributed Messaging System for Log Processing](https://notes.stephenholiday.com/Kafka.pdf) (paper)

## Practice

### Design exercise: Event Streaming & Kafka

Partitioned logs, producers, consumer groups, offsets, ordering, delivery semantics, backpressure, and stream processing. Implement designOutline() returning non-empty values for: partitioning, deliverySemantics, consumerRecovery. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with partitioning, deliverySemantics, consumerRecovery plus an explicit failure mode or trade-off.

## Review prompts

- Kafka guarantees ordering per partition. What does that force on your partition key choice?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues)

## Related concepts

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues)
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching)

## Learning paths

- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
