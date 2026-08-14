# Distributed Workflows & Temporal

Durable execution, event histories, deterministic replay, activities, retries, timers, and long-running workflows.

- Difficulty: core
- Tracks: Distributed Systems

## Mental model

A durable workflow persists decisions as history and replays deterministic code after failure. Side effects live in retryable activities with explicit idempotency.



## Primary sources

- [Netherite: Efficient Execution of Serverless Workflows (PVLDB 15)](https://www.vldb.org/pvldb/vol15/p1591-burckhardt.pdf) (doc)
- [Reliable Actors with Retry Orchestration](https://arxiv.org/abs/2111.11562) (doc)
- [Workflows, a New Abstraction for Distributed Systems — Dominik Tornow (Strange Loop 2022)](https://www.youtube.com/watch?v=V_5WeVmyhzg) (video)
- [Durable Functions: Semantics for Stateful Serverless (OOPSLA '21)](https://www.microsoft.com/en-us/research/publication/durable-functions-semantics-for-stateful-serverless/) (paper)
- [Temporal Documentation](https://docs.temporal.io/) (doc)

## Practice

### Design exercise: Distributed Workflows & Temporal

Durable execution, event histories, deterministic replay, activities, retries, timers, and long-running workflows. Implement designOutline() returning non-empty values for: workflowHistory, deterministicReplay, activityIdempotency. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with workflowHistory, deterministicReplay, activityIdempotency plus an explicit failure mode or trade-off.

## Review prompts

- Durable execution replays workflow code after a crash. What does that require of the code you write?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra)

## Related concepts

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra)
- [Distributed Failure Recovery](https://learn.significanthobbies.com/curriculum/concepts/distributed-failure-recovery)

## Learning paths

- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
