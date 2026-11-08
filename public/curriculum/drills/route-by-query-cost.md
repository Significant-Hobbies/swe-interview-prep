# Route by cost and difficulty

> Classify queries: "2+2" → small model; "design payment system" → large model. Write a 2-rule router on length and keyword "design".

Canonical: https://learn.significanthobbies.com/curriculum/drills/route-by-query-cost

Classify queries: "2+2" → small model; "design payment system" → large model. Write a 2-rule router on length and keyword "design".

## The mechanism

Not every request needs the frontier model. A router classifies difficulty and dispatches: small/cheap model for easy calls, large model for hard ones — with cost and latency tracked per route.

## Expected evidence

Rule-based router with fallback to large on low confidence.

## Hints

- Cheap path for easy queries.
- Escalate on failure.

## Sources and practice

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
- [FrugalGPT: Using LLMs While Reducing Cost and Improving Performance (Chen et al.)](https://arxiv.org/abs/2305.05176)
- [How to Scale Your Model (JAX ML scaling book)](https://jax-ml.github.io/scaling-book/)
- [RouteLLM: Learning to Route LLMs with Preference Data](https://arxiv.org/abs/2406.18665)
- [Study Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/route-by-query-cost)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
