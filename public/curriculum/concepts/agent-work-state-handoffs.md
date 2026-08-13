# Agent Work State & Handoffs

Versioned goals, plans, checkpoints, evidence, blockers, and next actions that let a new session resume without relying on hidden conversational memory.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

A context window is a worker shift, not durable storage. The repository or workflow log owns the recoverable state: what was requested, what changed, what was verified, what failed, and the smallest safe next action. A handoff is correct when a fresh process can resume from artifacts alone.

## Where it matters

Long-running coding tasks, session compaction, workflow checkpoints, crash recovery, shift handoffs, and resumable background agents.

## Common mistakes

- Saving a narrative summary without exact files, commands, or observed results
- Marking a task complete without durable verification evidence
- Letting the chat transcript become the only record of decisions and remaining work

## Primary sources

- [Effective Harnesses for Long-running Agents (Anthropic)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (article)
- [OpenAI — Symphony orchestration specification](https://openai.com/index/open-source-codex-orchestration-symphony/) (article)

## Practice

### Create a durable agent handoff

Implement createHandoff(input) returning a JSON-safe object with schemaVersion 1, goal, status, completed, evidence, blockers, and nextAction. Reject an input that claims status 'complete' without evidence. nextAction must be one concrete action, not a list, and every evidence item must include both command and observed output.

**Expected evidence:** A checkpoint that a fresh session can validate and resume without reading prior chat.

## Review prompts

- What minimum state must survive a context reset so a different agent session can safely resume an unfinished change?

## Build evidence

- **Build a Complete Coding-Agent Harness** — Build a repository-local harness that can take one bounded engineering task from initialization through implementation, verification, durable handoff, and explicit termination without relying on hidden machine state or chat memory.
- **Automate and Evaluate a Maker-Checker Loop** — Automate a bounded loop in which a maker attempts one task, an independent checker evaluates explicit acceptance criteria, failures return actionable evidence, and the orchestrator stops on success, escalation, cancellation, or budget exhaustion. Compare it with a baseline harness on a frozen task suite.

## Prerequisites

- [Agent Environment Contracts](https://learn.significanthobbies.com/curriculum/concepts/agent-environment-contracts.html)

## Related concepts

- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution.html)
- [Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context.html)
- [Agent Run Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/agent-run-lifecycle.html)

## Learning paths

- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering.html)
