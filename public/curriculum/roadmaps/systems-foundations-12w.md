# 12-Week Systems Foundations

Build a mechanism-first model from hardware and kernels through runtimes, networks, performance, and isolation. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Build a mechanism-first model from hardware and kernels through runtimes, networks, performance, and isolation.
- Tracks: Systems Foundations

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html) — Identifying classes, attributes, relationships.
- [Data Representation](https://learn.significanthobbies.com/curriculum/concepts/data-representation.html) — Binary and hexadecimal, two's complement, IEEE-754 floating point, Unicode, byte order, and serialized bytes.
- [Program Memory Model](https://learn.significanthobbies.com/curriculum/concepts/program-memory-model.html) — Pointers, stack frames, heap allocation, object lifetime, executable loading, and the transition from a program on disk to a running process.
- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html) — CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them.
- [Operating System Mechanics](https://learn.significanthobbies.com/curriculum/concepts/operating-system-mechanics.html) — Processes, threads, virtual memory, scheduling, filesystems, syscalls, and kernel boundaries.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [Network Protocol Engineering](https://learn.significanthobbies.com/curriculum/concepts/network-protocol-engineering.html) — Packet flow across Ethernet, IP, TCP/QUIC, TLS, DNS, HTTP, load balancers, and application protocols.
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html) — Thread-safety, locks, producer-consumer.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [Runtime & Performance Engineering](https://learn.significanthobbies.com/curriculum/concepts/runtime-performance-engineering.html) — Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency.
- [Security & Isolation Boundaries](https://learn.significanthobbies.com/curriculum/concepts/security-isolation-boundaries.html) — Threat models, least privilege, capabilities, process and VM isolation, side channels, and secure defaults.

### Build evidence

- **Synthesize: Systems Foundations** — Build a tiny HTTP/1.1 static-file server on raw TCP sockets without a framework or high-level HTTP server library. Parse requests, serve bounded files, handle partial I/O, inject failures, measure the result, and explain how the operating system, network, memory, concurrency, and storage paths interact.
