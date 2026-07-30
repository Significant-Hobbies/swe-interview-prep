# Prompt & Version Logging

Treating prompts as versioned artifacts with logged inputs/outputs.

- Difficulty: core
- Tracks: Evaluation & AI Reliability, AI Systems

## Mental model

Treat prompts like code — every production change gets a version, a saved diff, and a re-run of your evals. Without that, when quality drops you have no commit to point at.



## Primary sources

- [PostHog — LLM analytics](https://posthog.com/docs/ai-engineering) (doc)

## Practice

### Diff two prompt versions

v1 and v2 prompts differ by one instruction. Name what you must re-run before shipping v2.

**Expected evidence:** Frozen eval set on both versions; compare pass rate delta.

## Review prompts

- Quality dropped last Tuesday. What must have been logged for you to find the cause?

## Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals.html)
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html)

## Learning paths

- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
