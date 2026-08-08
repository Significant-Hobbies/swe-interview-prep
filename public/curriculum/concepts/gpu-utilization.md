# GPU Utilization

Compute occupancy, memory bandwidth, kernel launch overhead, tensor parallelism, profiling, and saturation.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

GPU utilization is not one percentage. Profile kernel occupancy, memory bandwidth, queue gaps, communication, and batch shape to find whether the workload is compute-, memory-, or launch-bound.



## Primary sources

- [Stanford CS149 Lecture 7 — GPU Architecture and CUDA Programming](https://gfxcourses.stanford.edu/cs149/fall23content/media/gpucuda/07_gpuarch.pdf) (doc)
- [Efficiently Scaling Transformer Inference](https://arxiv.org/abs/2211.05102) (doc)
- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135) (doc)
- [Stanford CS336 — Lecture 5: GPUs (Language Modeling from Scratch, Spring 2025)](https://www.youtube.com/watch?v=6OBtO9niT00) (video)
- [Roofline: An Insightful Visual Performance Model for Multicore Architectures (UCB/EECS-2008-134)](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2008/EECS-2008-134.pdf) (paper)
- [NVIDIA Nsight Systems Documentation](https://docs.nvidia.com/nsight-systems/) (doc)

## Practice

### Design exercise: GPU Utilization

Compute occupancy, memory bandwidth, kernel launch overhead, tensor parallelism, profiling, and saturation. Implement designOutline() returning non-empty values for: profile, bottleneckClass, saturationPlan. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with profile, bottleneckClass, saturationPlan plus an explicit failure mode or trade-off.

## Review prompts

- nvidia-smi reports 100% utilization but throughput is poor. Why is that number misleading, and what do you measure instead?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware.html)

## Related concepts

- [Speculative Decoding](https://learn.significanthobbies.com/curriculum/concepts/speculative-decoding.html)
- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html)
