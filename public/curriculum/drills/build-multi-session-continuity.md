# Create a durable agent handoff

> Implement createHandoff(input) returning a JSON-safe object with schemaVersion 1, goal, status, completed, evidence, blockers, and nextAction. Reject an input that claims status 'complete' without evidence. nextAction must be one concrete action, not a list, and every evidence item must include both command and observed output.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-multi-session-continuity

Implement createHandoff(input) returning a JSON-safe object with schemaVersion 1, goal, status, completed, evidence, blockers, and nextAction. Reject an input that claims status 'complete' without evidence. nextAction must be one concrete action, not a list, and every evidence item must include both command and observed output.

## The mechanism

A context window is a worker shift, not durable storage. The repository or workflow log owns the recoverable state: what was requested, what changed, what was verified, what failed, and the smallest safe next action. A handoff is correct when a fresh process can resume from artifacts alone.

## Expected evidence

A checkpoint that a fresh session can validate and resume without reading prior chat.

## Hints

- Persist observations, not merely 'tests passed'.
- A good next action is the smallest safe continuation from the recorded state.

## Sources and practice

- [Effective Harnesses for Long-running Agents (Anthropic)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [OpenAI — Symphony orchestration specification](https://openai.com/index/open-source-codex-orchestration-symphony/)
- [Study Agent Work State & Handoffs](https://learn.significanthobbies.com/curriculum/concepts/agent-work-state-handoffs)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-multi-session-continuity)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
