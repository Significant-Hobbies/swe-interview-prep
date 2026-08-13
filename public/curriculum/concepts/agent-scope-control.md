# Agent Scope Control

Bounded task decomposition, allowed edit roots, budgets, change-size limits, and escalation when evidence invalidates the plan.

- Difficulty: core
- Tracks: Agent Systems, Developer Tools & Code Intelligence

## Mental model

Scope is a runtime invariant, not a sentence in a prompt. Convert the goal into a bounded change surface, measurable completion condition, and explicit escalation triggers. Each observation may narrow or revise the plan, but expanding authority requires a deliberate decision.

## Where it matters

Patch-size controls, allowed edit roots, task queues, budget enforcement, blast-radius limits, and agent escalation policies.

## Common mistakes

- Treating an ambitious goal as permission to mutate unrelated systems
- Continuing after evidence contradicts the plan instead of replanning
- Using token or time limits without a semantic completion or escalation condition

## Primary sources

- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/) (article)
- [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents) (article)

## Practice

### Enforce runtime scope and escalation

Implement scopeDecision(contract, observation). contract contains allowedRoots, maxFiles, and objective. observation contains touchedFiles, objectiveSatisfied, and planInvalidated. Return 'continue' only while every file is inside an allowed root, file count is within budget, the objective is incomplete, and the plan remains valid. Return 'complete' only when the objective is satisfied within scope. Return 'escalate' for any scope breach or invalidated plan.

**Expected evidence:** A semantic scope gate that distinguishes continue, complete, and escalate.

## Review prompts

- Why is a token or time budget insufficient scope control, and which semantic conditions should make an agent continue, complete, or escalate?

## Build evidence

- **Build a Complete Coding-Agent Harness** — Build a repository-local harness that can take one bounded engineering task from initialization through implementation, verification, durable handoff, and explicit termination without relying on hidden machine state or chat memory.
- **Automate and Evaluate a Maker-Checker Loop** — Automate a bounded loop in which a maker attempts one task, an independent checker evaluates explicit acceptance criteria, failures return actionable evidence, and the orchestrator stops on success, escalation, cancellation, or budget exhaustion. Compare it with a baseline harness on a frozen task suite.

## Prerequisites

- [Agent Work State & Handoffs](https://learn.significanthobbies.com/curriculum/concepts/agent-work-state-handoffs.html)

## Related concepts

- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems.html)
- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability.html)
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing.html)

## Learning paths

- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering.html)
