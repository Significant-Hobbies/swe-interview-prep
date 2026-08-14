# 12-Week Infrastructure & Platforms

Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads.
- Tracks: Infrastructure & Platforms

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency) — Idempotency keys and dedup windows for safe retries of mutations.
- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues) — Kafka, SQS, exactly-once vs at-least-once.
- [Cloud Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/cloud-infrastructure) — Regions, zones, networks, compute, managed storage, identity, load balancing, and control planes.
- [Containers & Kubernetes](https://learn.significanthobbies.com/curriculum/concepts/containers-kubernetes) — Namespaces, cgroups, OCI images, container runtimes, Kubernetes scheduling, controllers, networking, and storage.
- [CI/CD & Developer Environments](https://learn.significanthobbies.com/curriculum/concepts/cicd-developer-environments) — Hermetic builds, reproducible environments, test gates, artifacts, previews, progressive delivery, and rollback.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [Scheduling & Orchestration](https://learn.significanthobbies.com/curriculum/concepts/platform-scheduling-orchestration) — Placement, queues, priorities, quotas, fairness, preemption, autoscaling, and reconciliation loops.
- [Infrastructure Automation](https://learn.significanthobbies.com/curriculum/concepts/infrastructure-automation) — Declarative infrastructure, state, plans, drift detection, policy checks, secrets boundaries, and safe changes.
- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs) — Offloading slow work to workers: scheduling, concurrency, visibility.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [Reliability & Fault Tolerance](https://learn.significanthobbies.com/curriculum/concepts/reliability-fault-tolerance) — SLOs, error budgets, redundancy, graceful degradation, overload control, and failure-domain design.
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq) — Backoff + jitter, poison messages, dead-letter queues.
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics) — Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.
- [Sandboxes & Execution Environments](https://learn.significanthobbies.com/curriculum/concepts/sandbox-execution-environments) — Processes, containers, microVMs, V8 isolates, WebAssembly, capabilities, quotas, and untrusted-code execution.

### Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.
