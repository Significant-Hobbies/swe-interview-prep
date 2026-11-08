# Design exercise: Distributed Workflows & Temporal

> Durable execution, event histories, deterministic replay, activities, retries, timers, and long-running workflows. Implement designOutline() returning non-empty values for: workflowHistory, deterministicReplay, activityIdempotency. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-distributed-workflows-temporal

Durable execution, event histories, deterministic replay, activities, retries, timers, and long-running workflows. Implement designOutline() returning non-empty values for: workflowHistory, deterministicReplay, activityIdempotency. Each value must name a concrete mechanism or decision.

## The mechanism

A durable workflow persists decisions as history and replays deterministic code after failure. Side effects live in retryable activities with explicit idempotency.

## Expected evidence

A design outline with workflowHistory, deterministicReplay, activityIdempotency plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Netherite: Efficient Execution of Serverless Workflows (PVLDB 15)](https://www.vldb.org/pvldb/vol15/p1591-burckhardt.pdf)
- [Reliable Actors with Retry Orchestration](https://arxiv.org/abs/2111.11562)
- [Workflows, a New Abstraction for Distributed Systems — Dominik Tornow (Strange Loop 2022)](https://www.youtube.com/watch?v=V_5WeVmyhzg)
- [Durable Functions: Semantics for Stateful Serverless (OOPSLA '21)](https://www.microsoft.com/en-us/research/publication/durable-functions-semantics-for-stateful-serverless/)
- [Temporal Documentation](https://docs.temporal.io/)
- [Study Distributed Workflows & Temporal](https://learn.significanthobbies.com/curriculum/concepts/distributed-workflows-temporal)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-distributed-workflows-temporal)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
