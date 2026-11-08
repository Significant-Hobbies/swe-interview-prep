# Design exercise: vLLM & Inference Engines

> Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture. Implement designOutline() returning non-empty values for: requestScheduler, memoryManager, executionBackend. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-inference-engines

Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture. Implement designOutline() returning non-empty values for: requestScheduler, memoryManager, executionBackend. Each value must name a concrete mechanism or decision.

## The mechanism

An inference engine is a runtime: it schedules requests, owns model and KV memory, dispatches kernels, exposes metrics, and enforces admission control.

## Expected evidence

A design outline with requestScheduler, memoryManager, executionBackend plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Orca: A Distributed Serving System for Transformer-Based Generative Models (OSDI '22)](https://www.usenix.org/conference/osdi22/presentation/yu)
- [SGLang: Efficient Execution of Structured Language Model Programs](https://arxiv.org/abs/2312.07104)
- [Stanford CS336 — Lecture 10: Inference (Language Modeling from Scratch, Spring 2025)](https://www.youtube.com/watch?v=fcgPYo3OtV0)
- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180)
- [Fast and Expressive LLM Inference with RadixAttention and SGLang (LMSYS)](https://lmsys.org/blog/2024-01-17-sglang/)
- [vLLM Documentation](https://docs.vllm.ai/)
- [Learn Inference — interactive guide to inference engineering](https://learn-inference.com/)
- [Inference Engineering (Philip Kiely, Baseten)](https://www.baseten.co/inference-engineering/)
- [Study vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-inference-engines)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
