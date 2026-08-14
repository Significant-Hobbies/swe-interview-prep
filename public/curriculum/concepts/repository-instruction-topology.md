# Repository Instruction Topology

Repository-wide and path-local instructions, precedence, ownership boundaries, and concise executable guidance for coding agents.

- Difficulty: core
- Tracks: Agent Systems, Developer Tools & Code Intelligence

## Mental model

Instructions form a scoped configuration tree. Broad rules establish invariants, nearer files refine behavior for a subtree, and direct task intent supplies the leaf-level objective. A useful instruction is discoverable, non-contradictory, and paired with the command or artifact that proves compliance.

## Where it matters

AGENTS.md hierarchies, repository custom instructions, package-local conventions, generated-code boundaries, and task-specific runbooks.

## Common mistakes

- Putting every rule in one root document until relevant guidance is buried
- Repeating the same rule at multiple scopes and letting copies drift
- Writing preferences that cannot be checked while omitting the actual validation command

## Primary sources

- [GitHub Docs — Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide) (doc)
- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/) (article)

## Practice

### Build a scoped repository instruction map

Implement instructionMap() for a repository with a root AGENTS.md and a packages/api/AGENTS.md. Return {root, api, precedence, checks}. root must contain exactly three concise repository-wide invariants. api must contain exactly two API-only refinements and must not repeat a root rule. precedence must explain in at least eight words that nearer instructions refine broader instructions without silently overriding direct task intent. checks must list two runnable validation commands.

**Expected evidence:** A non-duplicative instruction tree with explicit precedence and executable checks.

## Review prompts

- A repository has a root instruction file and a stricter one inside packages/payments. What belongs at each level, and how should an agent resolve them for a payment-file edit?

## Build evidence

- **Build a Complete Coding-Agent Harness** — Build a repository-local harness that can take one bounded engineering task from initialization through implementation, verification, durable handoff, and explicit termination without relying on hidden machine state or chat memory.
- **Automate and Evaluate a Maker-Checker Loop** — Automate a bounded loop in which a maker attempts one task, an independent checker evaluates explicit acceptance criteria, failures return actionable evidence, and the orchestrator stops on success, escalation, cancellation, or budget exhaustion. Compare it with a baseline harness on a frozen task suite.

## Prerequisites

- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence)

## Related concepts

- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems)
- [Agent Scope Control](https://learn.significanthobbies.com/curriculum/concepts/agent-scope-control)
- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence)

## Learning paths

- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering)
