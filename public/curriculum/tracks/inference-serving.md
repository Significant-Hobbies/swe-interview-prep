# Inference & Serving

Inference engines, batching, KV caches, attention kernels, decoding, routing, hardware utilization, and serving economics.

This track contains 12 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w) — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics.
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w) — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI.
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor) — Follow one model workload from representation and gradients to memory, kernels, scheduling, and serving economics.

## Concepts

- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing) (core) — Sending each request to the cheapest model that can handle it.
- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime) (advanced) — Web Workers, WASM, OPFS, TypedArrays.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu) (advanced) — WGSL, compute kernels, matmul, CPU parity.
- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines) (core) — Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture.
- [Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching) (core) — Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness.
- [KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention) (core) — Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure.
- [FlashAttention & Attention Kernels](https://learn.significanthobbies.com/curriculum/concepts/flashattention-kernels) (core) — IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention.
- [Speculative Decoding](https://learn.significanthobbies.com/curriculum/concepts/speculative-decoding) (core) — Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation.
- [GPU Utilization](https://learn.significanthobbies.com/curriculum/concepts/gpu-utilization) (core) — Compute occupancy, memory bandwidth, kernel launch overhead, tensor parallelism, profiling, and saturation.
- [Inference Cost & Latency Optimization](https://learn.significanthobbies.com/curriculum/concepts/inference-cost-latency) (core) — Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request.
- [Local & On-device Inference](https://learn.significanthobbies.com/curriculum/concepts/local-on-device-inference) (core) — llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory.
- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware) (core) — GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit.
