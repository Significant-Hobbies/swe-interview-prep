# Enforce runtime scope and escalation

> Implement scopeDecision(contract, observation). contract contains allowedRoots, maxFiles, and objective. observation contains touchedFiles, objectiveSatisfied, and planInvalidated. Return 'continue' only while every file is inside an allowed root, file count is within budget, the objective is incomplete, and the plan remains valid. Return 'complete' only when the objective is satisfied within scope. Return 'escalate' for any scope breach or invalidated plan.

Canonical: https://learn.significanthobbies.com/curriculum/drills/add-feedback-and-scope-control

Implement scopeDecision(contract, observation). contract contains allowedRoots, maxFiles, and objective. observation contains touchedFiles, objectiveSatisfied, and planInvalidated. Return 'continue' only while every file is inside an allowed root, file count is within budget, the objective is incomplete, and the plan remains valid. Return 'complete' only when the objective is satisfied within scope. Return 'escalate' for any scope breach or invalidated plan.

## The mechanism

Scope is a runtime invariant, not a sentence in a prompt. Convert the goal into a bounded change surface, measurable completion condition, and explicit escalation triggers. Each observation may narrow or revise the plan, but expanding authority requires a deliberate decision.

## Expected evidence

A semantic scope gate that distinguishes continue, complete, and escalate.

## Hints

- Normalize path boundaries so src/api-old does not accidentally match src/api.
- An invalidated plan requires review even if the file budget has not been exhausted.

## Sources and practice

- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)
- [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [Study Agent Scope Control](https://learn.significanthobbies.com/curriculum/concepts/agent-scope-control)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/add-feedback-and-scope-control)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
