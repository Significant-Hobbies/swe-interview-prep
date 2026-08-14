# Model Routing

Sending each request to the cheapest model that can handle it.

- Difficulty: core
- Tracks: Inference & Serving, AI Systems

## Mental model

Not every request needs the frontier model. A router classifies difficulty and dispatches: small/cheap model for easy calls, large model for hard ones — with cost and latency tracked per route.

## Where it matters

Cost optimization in production LLM apps, the free-AI-first principle.

## Common mistakes

- Routing without evals, so quality silently drops
- No fallback when the cheap model fails

## Primary sources

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents) (article)
- [FrugalGPT: Using LLMs While Reducing Cost and Improving Performance (Chen et al.)](https://arxiv.org/abs/2305.05176) (paper)
- [How to Scale Your Model (JAX ML scaling book)](https://jax-ml.github.io/scaling-book/) (course)
- [RouteLLM: Learning to Route LLMs with Preference Data](https://arxiv.org/abs/2406.18665) (paper)

## Practice

### Route by cost and difficulty

Classify queries: "2+2" → small model; "design payment system" → large model. Write a 2-rule router on length and keyword "design".

**Expected evidence:** Rule-based router with fallback to large on low confidence.

## Review prompts

- Why must model routing be backed by evals?

## Build evidence

- **Model router** — Route each request to the cheapest model that passes evals for that request class.
- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs)

## Related concepts

- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals)
- [Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
