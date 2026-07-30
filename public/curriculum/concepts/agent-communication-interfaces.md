# Agent Communication & Interfaces

Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

Reliable agent interfaces exchange typed state and evidence, not vague prose. Messages need identity, intent, status, result, error, and provenance.



## Primary sources

- [A Survey of AI Agent Protocols](https://arxiv.org/abs/2504.16736) (doc)
- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents) (doc)
- [A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, and ANP](https://arxiv.org/abs/2505.02279) (paper)
- [How We Built Our Multi-agent Research System (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system) (article)
- [Agent2Agent Protocol](https://a2a-protocol.org/latest/) (doc)

## Practice

### Design exercise: Agent Communication & Interfaces

Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status. Implement designOutline() returning non-empty values for: messageSchema, statusModel, provenance. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with messageSchema, statusModel, provenance plus an explicit failure mode or trade-off.

## Review prompts

- Why do agent-to-agent messages need typed status and provenance rather than prose?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Multi-agent Coordination](https://learn.significanthobbies.com/curriculum/concepts/multi-agent-coordination.html)

## Related concepts

- [Multi-agent Coordination](https://learn.significanthobbies.com/curriculum/concepts/multi-agent-coordination.html)
- [Browser & Computer-use Agents](https://learn.significanthobbies.com/curriculum/concepts/browser-computer-use-agents.html)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w.html)
