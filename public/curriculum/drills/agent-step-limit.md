# Cap agent tool loop

> Agent calls tools in a loop. Max 5 steps, same tool 2× in a row triggers stop. Steps: search, search, calc, search, search, calc. When stop?

Canonical: https://learn.significanthobbies.com/curriculum/drills/agent-step-limit

Agent calls tools in a loop. Max 5 steps, same tool 2× in a row triggers stop. Steps: search, search, calc, search, search, calc. When stop?

## The mechanism

An agent is a loop: the model proposes an action, a tool executes it, the observation re-enters context, repeat until done. The engineering is in the guardrails — step limits, memory, and human approval — not the prompt.

## Expected evidence

Stop at step 3 (duplicate search) or step 5 by max steps — implement both guards.

## Hints

- Infinite loops burn tokens.
- Log each tool call.

## Sources and practice

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366)
- [LLM Powered Autonomous Agents (Lilian Weng)](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Study Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/agent-step-limit)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
