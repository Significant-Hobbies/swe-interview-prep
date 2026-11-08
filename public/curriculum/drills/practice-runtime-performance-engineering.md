# Design exercise: Runtime & Performance Engineering

> Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency. Implement designOutline() returning non-empty values for: workload, profile, measurement. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-runtime-performance-engineering

Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency. Implement designOutline() returning non-empty values for: workload, profile, measurement. Each value must name a concrete mechanism or decision.

## The mechanism

Performance work starts with a workload and a profile. Optimize the dominant resource, preserve correctness, and measure throughput, tail latency, memory, and cost together.

## Expected evidence

A design outline with workload, profile, measurement plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [USENIX ATC '17: Visualizing Performance with Flame Graphs (Brendan Gregg)](https://www.youtube.com/watch?v=D53T1Ejig1Q)
- [Google-Wide Profiling: A Continuous Profiling Infrastructure for Data Centers](https://research.google/pubs/google-wide-profiling-a-continuous-profiling-infrastructure-for-data-centers/)
- [MIT 6.172 — Performance Engineering of Software Systems (OCW)](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/)
- [Brendan Gregg — Linux Performance](https://www.brendangregg.com/linuxperf.html)
- [Study Runtime & Performance Engineering](https://learn.significanthobbies.com/curriculum/concepts/runtime-performance-engineering)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-runtime-performance-engineering)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
