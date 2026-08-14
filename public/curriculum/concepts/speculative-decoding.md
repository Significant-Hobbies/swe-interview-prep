# Speculative Decoding

Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

A cheap draft proposes several tokens and the target model verifies them in parallel. Speedup depends on acceptance rate and verification cost while preserving the target distribution.



## Primary sources

- [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192) (paper)

## Practice

### Design exercise: Speculative Decoding

Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation. Implement designOutline() returning non-empty values for: draftStrategy, verification, acceptanceRate. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with draftStrategy, verification, acceptanceRate plus an explicit failure mode or trade-off.

## Review prompts

- Speculative decoding runs two models yet is faster, and the output distribution is unchanged. Explain both claims.

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling)
- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines)

## Related concepts

- [FlashAttention & Attention Kernels](https://learn.significanthobbies.com/curriculum/concepts/flashattention-kernels)
- [GPU Utilization](https://learn.significanthobbies.com/curriculum/concepts/gpu-utilization)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
