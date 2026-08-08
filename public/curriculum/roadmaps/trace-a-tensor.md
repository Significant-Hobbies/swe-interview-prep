# Trace a Tensor

A compact AI-systems synthesis path. Four milestones connect the work expressed by a model to the machine and serving layers that execute it, ending in a measured bottleneck diagnosis and defended optimization.

- Horizon: 30d
- Outcome: Follow one model workload from representation and gradients to memory, kernels, scheduling, and serving economics.
- Tracks: Systems Foundations, AI Systems, Inference & Serving

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Week 1 — Represent and differentiate

Explain how values become tensors and how a forward computation creates the work required by backpropagation.

### Concepts

- [Data Representation](https://learn.significanthobbies.com/curriculum/concepts/data-representation.html) — Binary and hexadecimal, two's complement, IEEE-754 floating point, Unicode, byte order, and serialized bytes.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop.html) — Chain rule, autograd, forward/backward passes.



## Milestone 2: Week 2 — Move and execute

Locate tensor data across the memory hierarchy and profile the runtime before choosing an optimization.

### Concepts

- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html) — CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them.
- [Runtime & Performance Engineering](https://learn.significanthobbies.com/curriculum/concepts/runtime-performance-engineering.html) — Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency.
- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware.html) — GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit.
- [GPU Utilization](https://learn.significanthobbies.com/curriculum/concepts/gpu-utilization.html) — Compute occupancy, memory bandwidth, kernel launch overhead, tensor parallelism, profiling, and saturation.



## Milestone 3: Week 3 — Change the work

Reduce data movement or numerical work with hardware-aware kernels and model representation changes while preserving quality.

### Concepts

- [FlashAttention & Attention Kernels](https://learn.significanthobbies.com/curriculum/concepts/flashattention-kernels.html) — IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention.
- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html) — Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.



## Milestone 4: Week 4 — Schedule, serve, and defend

Connect engine scheduling to latency, throughput, utilization, quality, and cost, then defend the measured system.

### Concepts

- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines.html) — Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture.
- [Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching.html) — Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness.
- [Inference Cost & Latency Optimization](https://learn.significanthobbies.com/curriculum/concepts/inference-cost-latency.html) — Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request.

### Build evidence

- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.
