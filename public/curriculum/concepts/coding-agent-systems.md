# Coding Agent Systems

Repository context, planning, file edits, tools, tests, sandboxes, review loops, and patch delivery.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

A coding agent is a repository-aware control loop. It needs scoped context, reversible edits, executable verification, and a clear handoff boundary.



## Primary sources

- [SWE-agent](https://swe-agent.com/) (doc)
- [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770) (paper)
- [OpenHands: An Open Platform for AI Software Developers](https://arxiv.org/abs/2407.16741) (paper)
- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents) (article)

## Practice

### Design exercise: Coding Agent Systems

Repository context, planning, file edits, tools, tests, sandboxes, review loops, and patch delivery. Implement designOutline() returning non-empty values for: repoContext, editLoop, verification. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with repoContext, editLoop, verification plus an explicit failure mode or trade-off.

## Review prompts

- What makes an edit reversible in a coding agent, and why does that matter more than edit quality?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [IDE & CLI Tooling](https://learn.significanthobbies.com/curriculum/concepts/ide-cli-tooling)

## Related concepts

- [IDE & CLI Tooling](https://learn.significanthobbies.com/curriculum/concepts/ide-cli-tooling)
- [Software Supply-chain Health](https://learn.significanthobbies.com/curriculum/concepts/software-supply-chain-health)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w)
