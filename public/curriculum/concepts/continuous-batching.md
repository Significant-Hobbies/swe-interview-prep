# Continuous Batching

Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

Continuous batching changes the batch after each decoding step, filling freed slots without waiting for the slowest request. Throughput improves at the cost of scheduler complexity.



## Primary sources

- [Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve (OSDI '24)](https://arxiv.org/abs/2403.02310) (doc)
- [USENIX OSDI '22 — Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.youtube.com/watch?v=Ob9PPLxETYU) (video)
- [Orca: A Distributed Serving System for Transformer-Based Generative Models (OSDI '22)](https://www.usenix.org/conference/osdi22/presentation/yu) (paper)
- [SGLang v0.4: Zero-Overhead Batch Scheduler (LMSYS)](https://lmsys.org/blog/2024-12-04-sglang-v0-4/) (article)
- [vLLM: Easy, Fast, and Cheap LLM Serving](https://blog.vllm.ai/2023/06/20/vllm.html) (doc)

## Practice

### Design exercise: Continuous Batching

Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness. Implement designOutline() returning non-empty values for: admissionPolicy, prefillDecode, fairness. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with admissionPolicy, prefillDecode, fairness plus an explicit failure mode or trade-off.

## Review prompts

- What does continuous batching change relative to static batching, and where does the throughput actually come from?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- [KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention.html)

## Related concepts

- [KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention.html)
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html)
