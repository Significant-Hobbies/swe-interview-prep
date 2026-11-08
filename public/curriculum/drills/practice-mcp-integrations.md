# Design exercise: MCP & Integrations

> Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust. Implement designOutline() returning non-empty values for: capabilities, transport, trustBoundary. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-mcp-integrations

Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust. Implement designOutline() returning non-empty values for: capabilities, transport, trustBoundary. Each value must name a concrete mechanism or decision.

## The mechanism

MCP standardizes how an AI host discovers and invokes external capabilities. The protocol boundary does not replace authentication, authorization, validation, or user approval.

## Expected evidence

A design outline with capabilities, transport, trustBoundary plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Code execution with MCP: building more efficient AI agents](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP Safety Audit: LLMs with the Model Context Protocol Allow Major Security Exploits](https://arxiv.org/abs/2504.03767)
- [Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions](https://arxiv.org/abs/2503.23278)
- [Introducing the Model Context Protocol (Anthropic)](https://www.anthropic.com/news/model-context-protocol)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/)
- [Study MCP & Integrations](https://learn.significanthobbies.com/curriculum/concepts/mcp-integrations)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-mcp-integrations)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
