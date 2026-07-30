# Durable Agent Execution

Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

A durable agent records decisions and side-effect identities so it can resume after interruption without repeating irreversible work.



## Primary sources

- [Serverless Workflows with Durable Functions and Netherite](https://arxiv.org/abs/2103.00033) (doc)
- [Atomix: Timely, Transactional Tool Use for Reliable Agentic Workflows](https://arxiv.org/abs/2602.14849) (doc)
- [Workflows, a New Abstraction for Distributed Systems — Dominik Tornow (Strange Loop 2022)](https://www.youtube.com/watch?v=V_5WeVmyhzg) (video)
- [Durable Functions: Semantics for Stateful Serverless (OOPSLA '21)](https://www.microsoft.com/en-us/research/publication/durable-functions-semantics-for-stateful-serverless/) (paper)
- [Temporal — Understanding Temporal (Durable Execution)](https://docs.temporal.io/evaluate/understanding-temporal) (doc)

## Practice

### Design exercise: Durable Agent Execution

Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery. Implement designOutline() returning non-empty values for: checkpoint, idempotency, resumeProtocol. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with checkpoint, idempotency, resumeProtocol plus an explicit failure mode or trade-off.

## Review prompts

- An agent crashes after calling a payment API but before recording the result. What makes recovery safe?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Browser & Computer-use Agents](https://learn.significanthobbies.com/curriculum/concepts/browser-computer-use-agents.html)

## Related concepts

- [Browser & Computer-use Agents](https://learn.significanthobbies.com/curriculum/concepts/browser-computer-use-agents.html)
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing.html)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w.html)
