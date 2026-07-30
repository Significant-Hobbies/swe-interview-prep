# vLLM & Inference Engines

Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

An inference engine is a runtime: it schedules requests, owns model and KV memory, dispatches kernels, exposes metrics, and enforces admission control.



## Primary sources

- [Orca: A Distributed Serving System for Transformer-Based Generative Models (OSDI '22)](https://www.usenix.org/conference/osdi22/presentation/yu) (doc)
- [SGLang: Efficient Execution of Structured Language Model Programs](https://arxiv.org/abs/2312.07104) (doc)
- [Stanford CS336 — Lecture 10: Inference (Language Modeling from Scratch, Spring 2025)](https://www.youtube.com/watch?v=fcgPYo3OtV0) (video)
- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180) (paper)
- [Fast and Expressive LLM Inference with RadixAttention and SGLang (LMSYS)](https://lmsys.org/blog/2024-01-17-sglang/) (article)
- [vLLM Documentation](https://docs.vllm.ai/) (doc)

## Practice

### Design exercise: vLLM & Inference Engines

Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture. Implement designOutline() returning non-empty values for: requestScheduler, memoryManager, executionBackend. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with requestScheduler, memoryManager, executionBackend plus an explicit failure mode or trade-off.

## Review prompts

- Prefill and decode have very different hardware profiles. Name each and say why it drives the scheduler's design.

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html)
- [KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
