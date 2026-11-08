# Design exercise: Durable Agent Execution

> Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery. Implement designOutline() returning non-empty values for: checkpoint, idempotency, resumeProtocol. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-durable-agent-execution

Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery. Implement designOutline() returning non-empty values for: checkpoint, idempotency, resumeProtocol. Each value must name a concrete mechanism or decision.

## The mechanism

A durable agent records decisions and side-effect identities so it can resume after interruption without repeating irreversible work.

## Expected evidence

A design outline with checkpoint, idempotency, resumeProtocol plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Serverless Workflows with Durable Functions and Netherite](https://arxiv.org/abs/2103.00033)
- [Atomix: Timely, Transactional Tool Use for Reliable Agentic Workflows](https://arxiv.org/abs/2602.14849)
- [Workflows, a New Abstraction for Distributed Systems — Dominik Tornow (Strange Loop 2022)](https://www.youtube.com/watch?v=V_5WeVmyhzg)
- [Durable Functions: Semantics for Stateful Serverless (OOPSLA '21)](https://www.microsoft.com/en-us/research/publication/durable-functions-semantics-for-stateful-serverless/)
- [Temporal — Understanding Temporal (Durable Execution)](https://docs.temporal.io/evaluate/understanding-temporal)
- [Study Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-durable-agent-execution)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
