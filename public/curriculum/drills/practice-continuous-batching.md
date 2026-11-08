# Design exercise: Continuous Batching

> Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness. Implement designOutline() returning non-empty values for: admissionPolicy, prefillDecode, fairness. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-continuous-batching

Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness. Implement designOutline() returning non-empty values for: admissionPolicy, prefillDecode, fairness. Each value must name a concrete mechanism or decision.

## The mechanism

Continuous batching changes the batch after each decoding step, filling freed slots without waiting for the slowest request. Throughput improves at the cost of scheduler complexity.

## Expected evidence

A design outline with admissionPolicy, prefillDecode, fairness plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve (OSDI '24)](https://arxiv.org/abs/2403.02310)
- [USENIX OSDI '22 — Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.youtube.com/watch?v=Ob9PPLxETYU)
- [Orca: A Distributed Serving System for Transformer-Based Generative Models (OSDI '22)](https://www.usenix.org/conference/osdi22/presentation/yu)
- [SGLang v0.4: Zero-Overhead Batch Scheduler (LMSYS)](https://lmsys.org/blog/2024-12-04-sglang-v0-4/)
- [vLLM: Easy, Fast, and Cheap LLM Serving](https://blog.vllm.ai/2023/06/20/vllm.html)
- [Study Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-continuous-batching)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
