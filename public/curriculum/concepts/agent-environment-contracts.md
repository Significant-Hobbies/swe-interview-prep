# Agent Environment Contracts

Deterministic bootstrap, dependency and runtime discovery, readiness probes, isolated workspaces, and explicit validation commands.

- Difficulty: core
- Tracks: Agent Systems, Developer Tools & Code Intelligence

## Mental model

Treat the development environment as an API offered to the agent: bootstrap has declared inputs, readiness has observable outputs, and every writable or networked capability has a boundary. If a fresh session cannot establish readiness mechanically, the environment contract is incomplete.

## Where it matters

Per-worktree development servers, reproducible setup scripts, CI parity, local observability stacks, and sandbox readiness checks.

## Common mistakes

- Assuming an undeclared global tool or manually prepared service exists
- Starting work before checking that dependencies and required services are ready
- Sharing mutable ports, databases, or build output across concurrent agent runs

## Primary sources

- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/) (article)
- [Model Context Protocol — Roots](https://modelcontextprotocol.io/specification/2025-03-26/client/roots) (doc)

## Practice

### Define an agent-readable environment contract

Implement environmentContract(worktreeId) returning {bootstrap, readiness, workspace, capabilities}. bootstrap and readiness must each contain two runnable commands. workspace must include the supplied worktreeId and distinct port, database, and output identifiers derived from it. capabilities must explicitly list filesystem, network, and secrets as allow, deny, or scoped.

**Expected evidence:** A reproducible bootstrap/readiness contract whose mutable resources are isolated per worktree.

## Review prompts

- Why is 'the project works on my machine' an unusable environment contract for an autonomous coding agent, and what evidence makes the contract reproducible?

## Build evidence

- **Build a Complete Coding-Agent Harness** — Build a repository-local harness that can take one bounded engineering task from initialization through implementation, verification, durable handoff, and explicit termination without relying on hidden machine state or chat memory.

## Prerequisites

- [Repository Instruction Topology](https://learn.significanthobbies.com/curriculum/concepts/repository-instruction-topology.html)

## Related concepts

- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence.html)
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing.html)
- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems.html)

## Learning paths

- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering.html)
