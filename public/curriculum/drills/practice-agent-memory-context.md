# Design exercise: Agent Memory & Context Management

> Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting. Implement designOutline() returning non-empty values for: memoryLayers, retrievalPolicy, provenance. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-agent-memory-context

Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting. Implement designOutline() returning non-empty values for: memoryLayers, retrievalPolicy, provenance. Each value must name a concrete mechanism or decision.

## The mechanism

Agent memory is a state architecture, not a larger prompt. Separate immediate working state, retrievable durable facts, event history, and summaries with provenance and expiry.

## Expected evidence

A design outline with memoryLayers, retrievalPolicy, provenance plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
- [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)
- [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442)
- [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Study Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-agent-memory-context)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
