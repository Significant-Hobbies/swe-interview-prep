# FlashAttention & Attention Kernels

IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

FlashAttention is exact attention reorganized around the memory hierarchy. Tiling and fusion reduce expensive HBM traffic without materializing the full attention matrix.



## Primary sources

- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135) (paper)

## Practice

### Design exercise: FlashAttention & Attention Kernels

IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention. Implement designOutline() returning non-empty values for: memoryTraffic, tiling, numericalStability. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with memoryTraffic, tiling, numericalStability plus an explicit failure mode or trade-off.

## Review prompts

- FlashAttention computes exact attention yet is much faster. Where does the speed come from if the arithmetic is unchanged?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head.html)

## Related concepts

- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html)
- [Speculative Decoding](https://learn.significanthobbies.com/curriculum/concepts/speculative-decoding.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html)
