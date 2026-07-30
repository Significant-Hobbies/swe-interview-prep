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

- **Synthesize: Systems Foundations** — Build a mechanism-first model from hardware and kernels through runtimes, networks, performance, and isolation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [Operating System Mechanics](https://learn.significanthobbies.com/curriculum/concepts/operating-system-mechanics.html)
- [Network Protocol Engineering](https://learn.significanthobbies.com/curriculum/concepts/network-protocol-engineering.html)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
