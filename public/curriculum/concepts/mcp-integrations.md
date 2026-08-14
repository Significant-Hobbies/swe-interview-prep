# MCP & Integrations

Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

MCP standardizes how an AI host discovers and invokes external capabilities. The protocol boundary does not replace authentication, authorization, validation, or user approval.



## Primary sources

- [Code execution with MCP: building more efficient AI agents](https://www.anthropic.com/engineering/code-execution-with-mcp) (doc)
- [MCP Safety Audit: LLMs with the Model Context Protocol Allow Major Security Exploits](https://arxiv.org/abs/2504.03767) (doc)
- [Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions](https://arxiv.org/abs/2503.23278) (paper)
- [Introducing the Model Context Protocol (Anthropic)](https://www.anthropic.com/news/model-context-protocol) (article)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/) (doc)

## Practice

### Design exercise: MCP & Integrations

Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust. Implement designOutline() returning non-empty values for: capabilities, transport, trustBoundary. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with capabilities, transport, trustBoundary plus an explicit failure mode or trade-off.

## Review prompts

- MCP standardises how a host discovers and calls tools. Name what it deliberately does not give you.

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context)

## Related concepts

- [Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context)
- [Multi-agent Coordination](https://learn.significanthobbies.com/curriculum/concepts/multi-agent-coordination)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w)
