# 12-Week Distributed Systems

Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure.
- Tracks: Distributed Systems

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle.html) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html) — Idempotency keys and dedup windows for safe retries of mutations.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html) — L4/L7, consistent hashing, health checks.
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html) — Ring, virtual nodes, rebalancing.
- [Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers.html) — Backoff, jitter, budgets, and breakers — retrying without turning a blip into an outage.
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html) — Raft, Paxos, leader election.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html) — Leader-follower, multi-leader, quorum.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html) — Range/hash/geo partitioning.
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem.html) — Strong/eventual/causal, PACELC.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues.html) — Kafka, SQS, exactly-once vs at-least-once.
- [Event Streaming & Kafka](https://learn.significanthobbies.com/curriculum/concepts/event-streaming-kafka.html) — Partitioned logs, producers, consumer groups, offsets, ordering, delivery semantics, backpressure, and stream processing.
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching.html) — Cache-aside, write-through, eviction policies.
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html) — WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra.html) — Service discovery, orchestration.
- [Distributed Workflows & Temporal](https://learn.significanthobbies.com/curriculum/concepts/distributed-workflows-temporal.html) — Durable execution, event histories, deterministic replay, activities, retries, timers, and long-running workflows.
- [Distributed Failure Recovery](https://learn.significanthobbies.com/curriculum/concepts/distributed-failure-recovery.html) — Partial failure, timeouts, retries, deduplication, fencing, repair, anti-entropy, and disaster recovery.

### Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.
