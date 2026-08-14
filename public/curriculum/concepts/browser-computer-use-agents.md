# Browser & Computer-use Agents

DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

Computer use is closed-loop control: observe current state, choose one bounded action, execute, verify the resulting state, and recover from drift.



## Primary sources

- [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://arxiv.org/abs/2307.13854) (doc)
- [Mind2Web: Towards a Generalist Agent for the Web](https://arxiv.org/abs/2306.06070) (doc)
- [OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments](https://arxiv.org/abs/2404.07972) (paper)
- [Developing a Computer Use Model (Anthropic)](https://www.anthropic.com/news/developing-computer-use) (article)
- [Playwright Documentation](https://playwright.dev/docs/intro) (doc)

## Practice

### Design exercise: Browser & Computer-use Agents

DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation. Implement designOutline() returning non-empty values for: observation, boundedAction, stateVerification. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with observation, boundedAction, stateVerification plus an explicit failure mode or trade-off.

## Review prompts

- Screenshot-plus-coordinates versus the accessibility tree: what does each get right and wrong?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Agent Communication & Interfaces](https://learn.significanthobbies.com/curriculum/concepts/agent-communication-interfaces)

## Related concepts

- [Agent Communication & Interfaces](https://learn.significanthobbies.com/curriculum/concepts/agent-communication-interfaces)
- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w)
