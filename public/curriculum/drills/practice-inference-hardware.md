# Design exercise: Inference Hardware

> GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit. Implement designOutline() returning non-empty values for: modelFit, memoryBandwidth, topology. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-inference-hardware

GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit. Implement designOutline() returning non-empty values for: modelFit, memoryBandwidth, topology. Each value must name a concrete mechanism or decision.

## The mechanism

Inference hardware is a memory-and-interconnect system around matrix engines. Choose by model fit, precision, bandwidth, topology, power, software support, and workload shape.

## Expected evidence

A design outline with modelFit, memoryBandwidth, topology plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [TPU v4: An Optically Reconfigurable Supercomputer for Machine Learning](https://arxiv.org/abs/2304.01433)
- [Stanford Lecture 15 — Efficient Methods and Hardware for Deep Learning (Song Han)](https://www.youtube.com/watch?v=eZdOkDtYMoo)
- [In-Datacenter Performance Analysis of a Tensor Processing Unit (ISCA '17)](https://arxiv.org/abs/1704.04760)
- [Stanford CS 217 — Hardware Accelerators for Machine Learning](https://cs217.stanford.edu/)
- [NVIDIA Hopper Architecture](https://resources.nvidia.com/en-us-tensor-core)
- [Study Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-inference-hardware)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
