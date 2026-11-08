# Design exercise: Agent Observability

> Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics. Implement designOutline() returning non-empty values for: runIdentity, stepSpans, redaction. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-agent-observability

Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics. Implement designOutline() returning non-empty values for: runIdentity, stepSpans, redaction. Each value must name a concrete mechanism or decision.

## The mechanism

Agent observability connects the final outcome to every decision and side effect. A run needs stable IDs, step spans, inputs, outputs, costs, errors, and redaction.

## Expected evidence

A design outline with runIdentity, stepSpans, redaction plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [A Survey on AgentOps: Categorization, Challenges, and Future Directions](https://arxiv.org/abs/2508.02121)
- [Observability in LLM Applications (Hamel Husain)](https://hamel.dev/notes/llm/officehours/observability.html)
- [OpenTelemetry GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [Study Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-agent-observability)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
