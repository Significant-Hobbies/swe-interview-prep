# Operating System Mechanics

Processes, threads, virtual memory, scheduling, filesystems, syscalls, and kernel boundaries.

- Difficulty: core
- Tracks: Systems Foundations

## Mental model

An operating system multiplexes hardware while enforcing isolation. Processes, virtual memory, schedulers, and filesystems are policies built on CPU, memory, and device mechanisms.



## Primary sources

- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/) (doc)

## Practice

### Design exercise: Operating System Mechanics

Processes, threads, virtual memory, scheduling, filesystems, syscalls, and kernel boundaries. Implement designOutline() returning non-empty values for: processModel, memoryModel, ioPath. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with processModel, memoryModel, ioPath plus an explicit failure mode or trade-off.

## Review prompts

- What does virtual memory actually buy beyond "more memory than you have"?

## Build evidence

- **Synthesize: Systems Foundations** — Build a tiny HTTP/1.1 static-file server on raw TCP sockets without a framework or high-level HTTP server library. Parse requests, serve bounded files, handle partial I/O, inject failures, measure the result, and explain how the operating system, network, memory, concurrency, and storage paths interact.

## Prerequisites

- [Data Representation](https://learn.significanthobbies.com/curriculum/concepts/data-representation.html)
- [Program Memory Model](https://learn.significanthobbies.com/curriculum/concepts/program-memory-model.html)
- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html)

## Related concepts

- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
