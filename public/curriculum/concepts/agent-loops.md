# Agent Loops

The plan → act → observe loop, with memory and stopping conditions.

- Difficulty: advanced
- Tracks: Agent Systems, AI Systems

## Mental model

An agent is a loop: the model proposes an action, a tool executes it, the observation re-enters context, repeat until done. The engineering is in the guardrails — step limits, memory, and human approval — not the prompt.

## Where it matters

Coding agents, research agents, Aliveville's agent world.

## Common mistakes

- No step limit, so the loop runs away
- Letting context grow unbounded across iterations
- No human approval gate for irreversible actions

## Primary sources

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents) (article)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) (paper)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) (paper)
- [LLM Powered Autonomous Agents (Lilian Weng)](https://lilianweng.github.io/posts/2023-06-23-agent/) (article)

## Practice

### Cap agent tool loop

Agent calls tools in a loop. Max 5 steps, same tool 2× in a row triggers stop. Steps: search, search, calc, search, search, calc. When stop?

**Expected evidence:** Stop at step 3 (duplicate search) or step 5 by max steps — implement both guards.

## Review prompts

- What guardrails keep an agent loop from running away?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling.html)

## Related concepts

- [Context Packing](https://learn.significanthobbies.com/curriculum/concepts/context-packing.html)
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w.html)
