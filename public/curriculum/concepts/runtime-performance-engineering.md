# Runtime & Performance Engineering

Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency.

- Difficulty: core
- Tracks: Systems Foundations

## Mental model

Performance work starts with a workload and a profile. Optimize the dominant resource, preserve correctness, and measure throughput, tail latency, memory, and cost together.



## Primary sources

- [USENIX ATC '17: Visualizing Performance with Flame Graphs (Brendan Gregg)](https://www.youtube.com/watch?v=D53T1Ejig1Q) (video)
- [Google-Wide Profiling: A Continuous Profiling Infrastructure for Data Centers](https://research.google/pubs/google-wide-profiling-a-continuous-profiling-infrastructure-for-data-centers/) (paper)
- [MIT 6.172 — Performance Engineering of Software Systems (OCW)](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/) (doc)
- [Brendan Gregg — Linux Performance](https://www.brendangregg.com/linuxperf.html) (doc)

## Practice

### Design exercise: Runtime & Performance Engineering

Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency. Implement designOutline() returning non-empty values for: workload, profile, measurement. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with workload, profile, measurement plus an explicit failure mode or trade-off.

## Review prompts

- Mean latency improved after your change and p99 got worse. What class of cause should you suspect?

## Build evidence

- **Synthesize: Systems Foundations** — Build a mechanism-first model from hardware and kernels through runtimes, networks, performance, and isolation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html)

## Related concepts

- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html)
- [Security & Isolation Boundaries](https://learn.significanthobbies.com/curriculum/concepts/security-isolation-boundaries.html)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
