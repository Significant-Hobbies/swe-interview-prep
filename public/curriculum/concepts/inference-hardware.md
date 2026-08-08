# Inference Hardware

GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

Inference hardware is a memory-and-interconnect system around matrix engines. Choose by model fit, precision, bandwidth, topology, power, software support, and workload shape.



## Primary sources

- [TPU v4: An Optically Reconfigurable Supercomputer for Machine Learning](https://arxiv.org/abs/2304.01433) (doc)
- [Stanford Lecture 15 — Efficient Methods and Hardware for Deep Learning (Song Han)](https://www.youtube.com/watch?v=eZdOkDtYMoo) (video)
- [In-Datacenter Performance Analysis of a Tensor Processing Unit (ISCA '17)](https://arxiv.org/abs/1704.04760) (paper)
- [Stanford CS 217 — Hardware Accelerators for Machine Learning](https://cs217.stanford.edu/) (doc)
- [NVIDIA Hopper Architecture](https://resources.nvidia.com/en-us-tensor-core) (doc)

## Practice

### Design exercise: Inference Hardware

GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit. Implement designOutline() returning non-empty values for: modelFit, memoryBandwidth, topology. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with modelFit, memoryBandwidth, topology plus an explicit failure mode or trade-off.

## Review prompts

- For single-stream LLM decoding, which hardware number predicts speed best, and why is it not peak TFLOPs?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- None assigned.

## Related concepts

- [GPU Utilization](https://learn.significanthobbies.com/curriculum/concepts/gpu-utilization.html)
- [Inference Cost & Latency Optimization](https://learn.significanthobbies.com/curriculum/concepts/inference-cost-latency.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html)
