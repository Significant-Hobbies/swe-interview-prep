# Agent Memory & Context Management

Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

Agent memory is a state architecture, not a larger prompt. Separate immediate working state, retrievable durable facts, event history, and summaries with provenance and expiry.



## Primary sources

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents) (doc)
- [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560) (paper)
- [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442) (paper)
- [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (article)

## Practice

### Design exercise: Agent Memory & Context Management

Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting. Implement designOutline() returning non-empty values for: memoryLayers, retrievalPolicy, provenance. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with memoryLayers, retrievalPolicy, provenance plus an explicit failure mode or trade-off.

## Review prompts

- Why is summarising old turns into the prompt not the same as giving an agent memory?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops.html)

## Related concepts

- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops.html)
- [MCP & Integrations](https://learn.significanthobbies.com/curriculum/concepts/mcp-integrations.html)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w.html)
