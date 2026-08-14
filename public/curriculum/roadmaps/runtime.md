# Runtime — what every runtime has to do

Companion to docs/learning/runtime-roadmap.md. Treats every runtime as doing the same five jobs: execute, allocate, schedule, isolate, observe. Phases cover each job, then deep-dives into language runtimes, AI inference runtimes, and edge runtimes.

- Horizon: 12mo
- Outcome: Build one cross-cutting mental model for V8, JVM, Go, BEAM, .NET CLR, vLLM, SGLang, Cloudflare Workers, and wasmtime.
- Tracks: System Design, AI Systems, Backend

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling) — Identifying classes, attributes, relationships.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication) — Leader-follower, multi-leader, quorum.
- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs) — Forcing LLM output into a validated JSON schema.
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus) — Raft, Paxos, leader election.



## Milestone 2: Phase 0-1 — Five-job model + execution

Frame what every runtime does. Tier ladders: interpreter, baseline JIT, optimising JIT, deopt.

### Concepts

- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management) — States, transitions, guards.
- [Strategy Pattern](https://learn.significanthobbies.com/curriculum/concepts/strategy-pattern) — Interchangeable algorithms.



## Milestone 3: Phase 2 — Memory & GC

Allocation, escape analysis, generational/concurrent/pauseless collectors, read/write barriers.

### Concepts





## Milestone 4: Phase 3 — Scheduling

Cooperative vs preemptive, async runtimes, fibers, work-stealing, goroutine + BEAM schedulers.

### Concepts

- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design) — Thread-safety, locks, producer-consumer.



## Milestone 5: Phase 4 — Isolation

Process, thread, V8 isolate, Wasm sandbox, Firecracker, gVisor.

### Concepts

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra) — Service discovery, orchestration.



## Milestone 6: Phase 5 — Observability & control

Sampling profilers, JFR, async-profiler, Go pprof, eBPF runtime hooks.

### Concepts

- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics) — Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.



## Milestone 7: Phase 6 — Language runtimes deep-dive

Pick at least one outside your comfort zone: JVM, Go, BEAM, V8, or .NET CLR.

### Concepts





## Milestone 8: Phase 7 — AI inference runtimes

vLLM PagedAttention, SGLang RadixAttention, llama.cpp, TensorRT-LLM, continuous batching.

### Concepts

- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing) — Sending each request to the cheapest model that can handle it.



## Milestone 9: Phase 8 — Edge & serverless runtimes

Workers, Deno, Bun, wasmtime, Firecracker — cold start, isolate startup, multi-tenant scheduling.

### Concepts

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra) — Service discovery, orchestration.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing) — L4/L7, consistent hashing, health checks.



## Milestone 10: Phase 9 — Synthesis project

Ship one of: cross-runtime benchmark, tier-up JIT, mini paged KV-cache, or isolate sandbox.

### Concepts
