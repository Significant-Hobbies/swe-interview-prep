# Agent Run Lifecycle

Run initialization, leases and heartbeats, progress transitions, budgets, completion evidence, cancellation, escalation, and safe termination.

- Difficulty: advanced
- Tracks: Agent Systems

## Mental model

An autonomous run is a finite-state machine with an owner and a budget. It starts only after prerequisites are ready, progresses through durable states, renews authority while healthy, and terminates as complete, failed, cancelled, or escalated. 'Keep trying' is not a lifecycle state.

## Where it matters

Background coding agents, durable workflows, scheduled maintenance, CI remediation loops, and multi-hour autonomous builds.

## Common mistakes

- Using a timer as the only stop condition
- Marking complete when commands ran rather than when the objective is satisfied
- Retrying permanent or authorization failures as if they were transient

## Primary sources

- [OpenAI — Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/) (article)
- [Effective Harnesses for Long-running Agents (Anthropic)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (article)

## Practice

### Implement a bounded agent run lifecycle

Implement transitionRun(state, event). Valid states are queued, running, checking, complete, blocked, cancelled. start moves queued to running only when event.ready is true; submit moves running to checking; accept moves checking to complete only when event.evidenceCount is positive; reject moves checking back to running when budget remains and to blocked otherwise; cancel moves any non-terminal state to cancelled. Invalid transitions must throw.

**Expected evidence:** A finite-state lifecycle whose completion and retry transitions require evidence and remaining authority.

## Review prompts

- Design the terminal states and gates for a long-running agent loop. Why is 'run until the timer ends' not a safe lifecycle?

## Build evidence

- **Build a Complete Coding-Agent Harness** — Build a repository-local harness that can take one bounded engineering task from initialization through implementation, verification, durable handoff, and explicit termination without relying on hidden machine state or chat memory.
- **Automate and Evaluate a Maker-Checker Loop** — Automate a bounded loop in which a maker attempts one task, an independent checker evaluates explicit acceptance criteria, failures return actionable evidence, and the orchestrator stops on success, escalation, cancellation, or budget exhaustion. Compare it with a baseline harness on a frozen task suite.

## Prerequisites

- [Agent Work State & Handoffs](https://learn.significanthobbies.com/curriculum/concepts/agent-work-state-handoffs.html)
- [Agent Scope Control](https://learn.significanthobbies.com/curriculum/concepts/agent-scope-control.html)

## Related concepts

- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution.html)
- [Long-running & Scheduled Agents](https://learn.significanthobbies.com/curriculum/concepts/long-running-scheduled-agents.html)
- [Independent Agent Verification](https://learn.significanthobbies.com/curriculum/concepts/independent-agent-verification.html)

## Learning paths

- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering.html)
