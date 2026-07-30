# 12-Week Agent Systems

Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control.
- Tracks: Agent Systems

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs.html) — Forcing LLM output into a validated JSON schema.
- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling.html) — Letting an LLM invoke functions/APIs via structured calls.
- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops.html) — The plan → act → observe loop, with memory and stopping conditions.
- [Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context.html) — Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting.
- [MCP & Integrations](https://learn.significanthobbies.com/curriculum/concepts/mcp-integrations.html) — Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [Multi-agent Coordination](https://learn.significanthobbies.com/curriculum/concepts/multi-agent-coordination.html) — Delegation, specialization, shared state, handoffs, arbitration, budgets, and avoiding coordination overhead.
- [Agent Communication & Interfaces](https://learn.significanthobbies.com/curriculum/concepts/agent-communication-interfaces.html) — Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status.
- [Browser & Computer-use Agents](https://learn.significanthobbies.com/curriculum/concepts/browser-computer-use-agents.html) — DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution.html) — Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery.
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing.html) — Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs.
- [Long-running & Scheduled Agents](https://learn.significanthobbies.com/curriculum/concepts/long-running-scheduled-agents.html) — Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets.

### Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.
