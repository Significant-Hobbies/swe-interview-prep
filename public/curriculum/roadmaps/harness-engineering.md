# Harness Engineering

Seven progressive builds turn instructions, repository legibility, environment setup, durable state, scope, feedback, verification, lifecycle, and evaluation into one complete coding-agent harness.

- Horizon: 30d
- Outcome: Design, build, verify, and evaluate the environment around a coding agent so it can make reliable progress across bounded and long-running tasks.
- Tracks: Agent Systems, Developer Tools & Code Intelligence, Evaluation & AI Reliability

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Build 1 — Prompt-only versus rules-first

Turn implicit expectations into scoped repository instructions with executable checks.

### Concepts

- [Repository Instruction Topology](https://learn.significanthobbies.com/curriculum/concepts/repository-instruction-topology) — Repository-wide and path-local instructions, precedence, ownership boundaries, and concise executable guidance for coding agents.
- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems) — Repository context, planning, file edits, tools, tests, sandboxes, review loops, and patch delivery.



## Milestone 2: Build 2 — Agent-readable workspace

Make repository structure, bootstrap, readiness, and capability boundaries discoverable from a fresh worktree.

### Concepts

- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence) — Structure, symbols, history, ownership, conventions, architecture, semantic search, and change-aware retrieval.
- [Agent Environment Contracts](https://learn.significanthobbies.com/curriculum/concepts/agent-environment-contracts) — Deterministic bootstrap, dependency and runtime discovery, readiness probes, isolated workspaces, and explicit validation commands.
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing) — Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs.



## Milestone 3: Build 3 — Multi-session continuity

Persist goal, progress, evidence, blockers, and next action so a new session resumes safely.

### Concepts

- [Agent Work State & Handoffs](https://learn.significanthobbies.com/curriculum/concepts/agent-work-state-handoffs) — Versioned goals, plans, checkpoints, evidence, blockers, and next actions that let a new session resume without relying on hidden conversational memory.
- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution) — Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery.
- [Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context) — Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting.



## Milestone 4: Build 4 — Runtime feedback and scope control

Bound authority and change size while using runtime evidence to continue, complete, replan, or escalate.

### Concepts

- [Agent Scope Control](https://learn.significanthobbies.com/curriculum/concepts/agent-scope-control) — Bounded task decomposition, allowed edit roots, budgets, change-size limits, and escalation when evidence invalidates the plan.
- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability) — Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics.
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing) — Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs.



## Milestone 5: Build 5 — Independent self-verification

Separate maker claims from a checker that reconstructs the contract and gathers fresh evidence.

### Concepts

- [Independent Agent Verification](https://learn.significanthobbies.com/curriculum/concepts/independent-agent-verification) — Maker-checker role separation, independent evidence gathering, adversarial review, and acceptance gates that do not trust the producer's self-report.
- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing) — Frozen eval sets, golden cases, rubric versions, stochastic thresholds, canaries, and release gates.
- [Tool-use Evaluations](https://learn.significanthobbies.com/curriculum/concepts/tool-use-evaluations) — Tool selection, argument correctness, sequencing, recovery, side-effect safety, and end-state verification.



## Milestone 6: Build 6 — Complete harness lifecycle

Connect initialization, bounded work, durable progress, checking, recovery, and terminal states in one harness.

### Concepts

- [Agent Run Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/agent-run-lifecycle) — Run initialization, leases and heartbeats, progress transitions, budgets, completion evidence, cancellation, escalation, and safe termination.
- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems) — Repository context, planning, file edits, tools, tests, sandboxes, review loops, and patch delivery.
- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution) — Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery.

### Build evidence

- **Build a Complete Coding-Agent Harness** — Build a repository-local harness that can take one bounded engineering task from initialization through implementation, verification, durable handoff, and explicit termination without relying on hidden machine state or chat memory.

## Milestone 7: Build 7 — Automated maker-checker loop

Run a bounded autonomous loop, compare it with a baseline, and ablate one harness component before deciding whether it should ship.

### Concepts

- [Harness Evaluation](https://learn.significanthobbies.com/curriculum/concepts/harness-evaluation) — Task suites, outcome rubrics, trajectory metrics, cost and latency budgets, ablations, and regression gates for the harness rather than the model alone.
- [Independent Agent Verification](https://learn.significanthobbies.com/curriculum/concepts/independent-agent-verification) — Maker-checker role separation, independent evidence gathering, adversarial review, and acceptance gates that do not trust the producer's self-report.
- [Agent Run Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/agent-run-lifecycle) — Run initialization, leases and heartbeats, progress transitions, budgets, completion evidence, cancellation, escalation, and safe termination.
- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing) — Frozen eval sets, golden cases, rubric versions, stochastic thresholds, canaries, and release gates.

### Build evidence

- **Automate and Evaluate a Maker-Checker Loop** — Automate a bounded loop in which a maker attempts one task, an independent checker evaluates explicit acceptance criteria, failures return actionable evidence, and the orchestrator stops on success, escalation, cancellation, or budget exhaustion. Compare it with a baseline harness on a frozen task suite.
