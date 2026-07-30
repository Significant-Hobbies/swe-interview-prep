# Agent Observability

Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics.

- Difficulty: core
- Tracks: Evaluation & AI Reliability

## Mental model

Agent observability connects the final outcome to every decision and side effect. A run needs stable IDs, step spans, inputs, outputs, costs, errors, and redaction.



## Primary sources

- [A Survey on AgentOps: Categorization, Challenges, and Future Directions](https://arxiv.org/abs/2508.02121) (paper)
- [Observability in LLM Applications (Hamel Husain)](https://hamel.dev/notes/llm/officehours/observability.html) (article)
- [OpenTelemetry GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) (doc)

## Practice

### Design exercise: Agent Observability

Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics. Implement designOutline() returning non-empty values for: runIdentity, stepSpans, redaction. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with runIdentity, stepSpans, redaction plus an explicit failure mode or trade-off.

## Review prompts

- What identifier makes agent traces useful, and what breaks without it?

## Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Quality, Cost & Latency Measurement](https://learn.significanthobbies.com/curriculum/concepts/quality-cost-latency-measurement.html)

## Related concepts

- [Quality, Cost & Latency Measurement](https://learn.significanthobbies.com/curriculum/concepts/quality-cost-latency-measurement.html)
- [Tracing & Replay](https://learn.significanthobbies.com/curriculum/concepts/tracing-replay.html)

## Learning paths

- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
