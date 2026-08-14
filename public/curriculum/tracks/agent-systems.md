# Agent Systems

Agent loops, tools, memory, MCP, coordination, durable execution, permissions, computer use, and long-running work.

This track contains 17 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w) — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control.
- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering) — Design, build, verify, and evaluate the environment around a coding agent so it can make reliable progress across bounded and long-running tasks.

## Concepts

- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling) (core) — Letting an LLM invoke functions/APIs via structured calls.
- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops) (advanced) — The plan → act → observe loop, with memory and stopping conditions.
- [Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context) (core) — Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting.
- [MCP & Integrations](https://learn.significanthobbies.com/curriculum/concepts/mcp-integrations) (core) — Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust.
- [Multi-agent Coordination](https://learn.significanthobbies.com/curriculum/concepts/multi-agent-coordination) (core) — Delegation, specialization, shared state, handoffs, arbitration, budgets, and avoiding coordination overhead.
- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution) (core) — Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery.
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing) (core) — Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs.
- [Browser & Computer-use Agents](https://learn.significanthobbies.com/curriculum/concepts/browser-computer-use-agents) (core) — DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation.
- [Agent Communication & Interfaces](https://learn.significanthobbies.com/curriculum/concepts/agent-communication-interfaces) (core) — Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status.
- [Long-running & Scheduled Agents](https://learn.significanthobbies.com/curriculum/concepts/long-running-scheduled-agents) (core) — Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets.
- [Repository Instruction Topology](https://learn.significanthobbies.com/curriculum/concepts/repository-instruction-topology) (core) — Repository-wide and path-local instructions, precedence, ownership boundaries, and concise executable guidance for coding agents.
- [Agent Environment Contracts](https://learn.significanthobbies.com/curriculum/concepts/agent-environment-contracts) (core) — Deterministic bootstrap, dependency and runtime discovery, readiness probes, isolated workspaces, and explicit validation commands.
- [Agent Work State & Handoffs](https://learn.significanthobbies.com/curriculum/concepts/agent-work-state-handoffs) (core) — Versioned goals, plans, checkpoints, evidence, blockers, and next actions that let a new session resume without relying on hidden conversational memory.
- [Agent Scope Control](https://learn.significanthobbies.com/curriculum/concepts/agent-scope-control) (core) — Bounded task decomposition, allowed edit roots, budgets, change-size limits, and escalation when evidence invalidates the plan.
- [Independent Agent Verification](https://learn.significanthobbies.com/curriculum/concepts/independent-agent-verification) (advanced) — Maker-checker role separation, independent evidence gathering, adversarial review, and acceptance gates that do not trust the producer's self-report.
- [Agent Run Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/agent-run-lifecycle) (advanced) — Run initialization, leases and heartbeats, progress transitions, budgets, completion evidence, cancellation, escalation, and safe termination.
- [Harness Evaluation](https://learn.significanthobbies.com/curriculum/concepts/harness-evaluation) (advanced) — Task suites, outcome rubrics, trajectory metrics, cost and latency budgets, ablations, and regression gates for the harness rather than the model alone.
