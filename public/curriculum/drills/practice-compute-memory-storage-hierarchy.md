# Design exercise: Compute, Memory & Storage Hierarchy

> CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them. Implement designOutline() returning non-empty values for: workingSet, dataMovement, bottleneck. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-compute-memory-storage-hierarchy

CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them. Implement designOutline() returning non-empty values for: workingSet, dataMovement, bottleneck. Each value must name a concrete mechanism or decision.

## The mechanism

Performance is usually data movement. Each level trades capacity and durability for latency and bandwidth, so placement decisions must follow the working set and access pattern.

## Expected evidence

A design outline with workingSet, dataMovement, bottleneck plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [What Every Programmer Should Know About Memory](https://akkadia.org/drepper/cpumemory.pdf)
- [Study Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-compute-memory-storage-hierarchy)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
