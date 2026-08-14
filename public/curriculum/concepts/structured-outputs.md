# Structured Outputs

Forcing LLM output into a validated JSON schema.

- Difficulty: core
- Tracks: AI Systems

## Mental model

Free text is unparseable glue between systems. Structured outputs constrain generation to a schema (via grammar/JSON mode) so the model's answer is a typed object your code can trust — or reject.

## Where it matters

Function arguments, extraction pipelines, agent state, every LLM-to-code boundary.

## Common mistakes

- Parsing JSON out of prose with regex instead of schema mode
- No validation step, so malformed output crashes downstream
- Over-nesting schemas the model cannot reliably fill

## Primary sources

- [OpenAI — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) (doc)

## Practice

### Schema-constrained extraction

Define a JSON schema and use structured-output mode to extract typed fields from unstructured text. Validate the result and reject on failure.

**Expected evidence:** A validated typed object, or an explicit rejection.

## Review prompts

- Why constrain LLM output to a schema instead of parsing prose?

## Build evidence

- **LLM eval harness** — A dataset + grader harness that scores LLM output on every prompt/model change.

## Prerequisites

- None assigned.

## Related concepts

- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling)
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
