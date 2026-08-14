# Tool Calling

Letting an LLM invoke functions/APIs via structured calls.

- Difficulty: core
- Tracks: Agent Systems, AI Systems

## Mental model

Tool calling turns the LLM into a planner: it emits a structured request to a named tool, your code executes it, and the result goes back into context. The model never runs code — it decides what to run.

## Where it matters

MCP servers, agent frameworks, Claude/OpenAI tool use.

## Common mistakes

- Vague tool descriptions, so the model picks the wrong tool
- No error handling for failed tool calls
- Letting tools take dangerous actions without approval

## Primary sources

- [Anthropic — Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) (doc)

## Practice

### Build a tool-calling loop

Give an LLM two tools (e.g. search and calculator). Run a loop: model emits a tool call, you execute it, feed the result back, repeat until done.

**Expected evidence:** A task solved across multiple tool calls.

## Review prompts

- In tool calling, what does the LLM actually do — and not do?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs)

## Related concepts

- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops)
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
