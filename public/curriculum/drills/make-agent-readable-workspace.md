# Define an agent-readable environment contract

> Implement environmentContract(worktreeId) returning {bootstrap, readiness, workspace, capabilities}. bootstrap and readiness must each contain two runnable commands. workspace must include the supplied worktreeId and distinct port, database, and output identifiers derived from it. capabilities must explicitly list filesystem, network, and secrets as allow, deny, or scoped.

Canonical: https://learn.significanthobbies.com/curriculum/drills/make-agent-readable-workspace

Implement environmentContract(worktreeId) returning {bootstrap, readiness, workspace, capabilities}. bootstrap and readiness must each contain two runnable commands. workspace must include the supplied worktreeId and distinct port, database, and output identifiers derived from it. capabilities must explicitly list filesystem, network, and secrets as allow, deny, or scoped.

## The mechanism

Treat the development environment as an API offered to the agent: bootstrap has declared inputs, readiness has observable outputs, and every writable or networked capability has a boundary. If a fresh session cannot establish readiness mechanically, the environment contract is incomplete.

## Expected evidence

A reproducible bootstrap/readiness contract whose mutable resources are isolated per worktree.

## Hints

- Readiness is an observable condition after bootstrap, not a second installation step.
- Derive every mutable resource name from the worktree identity so concurrent runs cannot collide.

## Sources and practice

- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)
- [Model Context Protocol — Roots](https://modelcontextprotocol.io/specification/2025-03-26/client/roots)
- [Study Agent Environment Contracts](https://learn.significanthobbies.com/curriculum/concepts/agent-environment-contracts)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/make-agent-readable-workspace)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
