# Design exercise: Event Streaming & Kafka

> Partitioned logs, producers, consumer groups, offsets, ordering, delivery semantics, backpressure, and stream processing. Implement designOutline() returning non-empty values for: partitioning, deliverySemantics, consumerRecovery. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-event-streaming-kafka

Partitioned logs, producers, consumer groups, offsets, ordering, delivery semantics, backpressure, and stream processing. Implement designOutline() returning non-empty values for: partitioning, deliverySemantics, consumerRecovery. Each value must name a concrete mechanism or decision.

## The mechanism

Kafka turns an append-only log into a coordination boundary. Ordering is per partition, progress is an offset, and consumers own replay and idempotency.

## Expected evidence

A design outline with partitioning, deliverySemantics, consumerRecovery plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Kafka: a Distributed Messaging System for Log Processing](https://notes.stephenholiday.com/Kafka.pdf)
- [Study Event Streaming & Kafka](https://learn.significanthobbies.com/curriculum/concepts/event-streaming-kafka)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-event-streaming-kafka)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
