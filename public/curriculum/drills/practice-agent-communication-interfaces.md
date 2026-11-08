# Design exercise: Agent Communication & Interfaces

> Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status. Implement designOutline() returning non-empty values for: messageSchema, statusModel, provenance. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-agent-communication-interfaces

Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status. Implement designOutline() returning non-empty values for: messageSchema, statusModel, provenance. Each value must name a concrete mechanism or decision.

## The mechanism

Reliable agent interfaces exchange typed state and evidence, not vague prose. Messages need identity, intent, status, result, error, and provenance.

## Expected evidence

A design outline with messageSchema, statusModel, provenance plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [A Survey of AI Agent Protocols](https://arxiv.org/abs/2504.16736)
- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
- [A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, and ANP](https://arxiv.org/abs/2505.02279)
- [How We Built Our Multi-agent Research System (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Agent2Agent Protocol](https://a2a-protocol.org/latest/)
- [Study Agent Communication & Interfaces](https://learn.significanthobbies.com/curriculum/concepts/agent-communication-interfaces)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-agent-communication-interfaces)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
