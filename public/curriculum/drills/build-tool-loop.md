# Build a tool-calling loop

> Give an LLM two tools (e.g. search and calculator). Run a loop: model emits a tool call, you execute it, feed the result back, repeat until done.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-tool-loop

Give an LLM two tools (e.g. search and calculator). Run a loop: model emits a tool call, you execute it, feed the result back, repeat until done.

## The mechanism

Tool calling turns the LLM into a planner: it emits a structured request to a named tool, your code executes it, and the result goes back into context. The model never runs code — it decides what to run.

## Expected evidence

A task solved across multiple tool calls.

## Hints

- Tool descriptions must be precise.
- Handle failed tool calls explicitly.

## Sources and practice

- [Anthropic — Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Study Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-tool-loop)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
