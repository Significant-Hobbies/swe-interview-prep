# KV Caching & PagedAttention

Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

The KV cache trades memory for avoided recomputation. PagedAttention maps logical token blocks to non-contiguous physical pages so variable-length requests waste less memory.



## Primary sources

- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180) (paper)

## Practice

### Design exercise: KV Caching & PagedAttention

Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure. Implement designOutline() returning non-empty values for: cacheSizing, pageMapping, evictionPolicy. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with cacheSizing, pageMapping, evictionPolicy plus an explicit failure mode or trade-off.

## Review prompts

- What fragmentation problem does PagedAttention solve, and what capability falls out of it for free?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines.html)

## Related concepts

- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines.html)
- [Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
