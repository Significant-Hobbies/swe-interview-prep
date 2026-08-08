# Compute, Memory & Storage Hierarchy

CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them.

- Difficulty: core
- Tracks: Systems Foundations

## Mental model

Performance is usually data movement. Each level trades capacity and durability for latency and bandwidth, so placement decisions must follow the working set and access pattern.



## Primary sources

- [What Every Programmer Should Know About Memory](https://akkadia.org/drepper/cpumemory.pdf) (paper)

## Practice

### Design exercise: Compute, Memory & Storage Hierarchy

CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them. Implement designOutline() returning non-empty values for: workingSet, dataMovement, bottleneck. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with workingSet, dataMovement, bottleneck plus an explicit failure mode or trade-off.

## Review prompts

- Two loops do the same arithmetic on the same array and one is many times slower. What is the usual cause?

## Build evidence

- **Synthesize: Systems Foundations** — Build a tiny HTTP/1.1 static-file server on raw TCP sockets without a framework or high-level HTTP server library. Parse requests, serve bounded files, handle partial I/O, inject failures, measure the result, and explain how the operating system, network, memory, concurrency, and storage paths interact.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- [Data Representation](https://learn.significanthobbies.com/curriculum/concepts/data-representation.html)

## Related concepts

- [Operating System Mechanics](https://learn.significanthobbies.com/curriculum/concepts/operating-system-mechanics.html)
- [Network Protocol Engineering](https://learn.significanthobbies.com/curriculum/concepts/network-protocol-engineering.html)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html)
