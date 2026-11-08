# Implement a bounded agent run lifecycle

> Implement transitionRun(state, event). Valid states are queued, running, checking, complete, blocked, cancelled. start moves queued to running only when event.ready is true; submit moves running to checking; accept moves checking to complete only when event.evidenceCount is positive; reject moves checking back to running when budget remains and to blocked otherwise; cancel moves any non-terminal state to cancelled. Invalid transitions must throw.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-complete-harness-lifecycle

Implement transitionRun(state, event). Valid states are queued, running, checking, complete, blocked, cancelled. start moves queued to running only when event.ready is true; submit moves running to checking; accept moves checking to complete only when event.evidenceCount is positive; reject moves checking back to running when budget remains and to blocked otherwise; cancel moves any non-terminal state to cancelled. Invalid transitions must throw.

## The mechanism

An autonomous run is a finite-state machine with an owner and a budget. It starts only after prerequisites are ready, progresses through durable states, renews authority while healthy, and terminates as complete, failed, cancelled, or escalated. 'Keep trying' is not a lifecycle state.

## Expected evidence

A finite-state lifecycle whose completion and retry transitions require evidence and remaining authority.

## Hints

- Terminal states must never silently restart.
- A failed check without remaining budget is an escalation, not another retry.

## Sources and practice

- [OpenAI — Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [Effective Harnesses for Long-running Agents (Anthropic)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Study Agent Run Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/agent-run-lifecycle)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-complete-harness-lifecycle)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
