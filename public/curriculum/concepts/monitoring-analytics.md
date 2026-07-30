# Observability

Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.

- Difficulty: core
- Tracks: Infrastructure & Platforms, Backend

## Mental model

The three pillars answer different questions: metrics say something is wrong, traces say where, logs say why. A structured log plus a request id is what stitches them together. OpenTelemetry is the reason that stitching survives a service hop — it standardises the signals and, more importantly, propagates trace context across process boundaries, so instrumentation is portable and a trace does not end at the edge of the service that started it.

## Where it matters

OpenTelemetry, Datadog, PostHog, every production service.

## Common mistakes

- Unstructured logs you cannot query
- Alerting on causes instead of user-facing symptoms (SLOs)
- No correlation id across services
- Instrumenting with a vendor SDK, so switching backends means re-instrumenting everything
- Dropping trace context at an async boundary, which silently truncates every downstream span
- Head sampling at a rate that discards exactly the rare failures you needed

## Primary sources

- [Site Reliability Engineering — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) (doc)
- [Canopy: An End-to-End Performance Tracing And Analysis System (SOSP '17)](https://www.microsoft.com/en-us/research/publication/canopy-an-end-to-end-performance-tracing-and-analysis-system/) (doc)
- [USENIX SREcon22 Asia/Pacific — OpenTelemetry and Observability: What, Why, and Why Now?](https://www.youtube.com/watch?v=sn6MWZPED24) (video)
- [Dapper, a Large-Scale Distributed Systems Tracing Infrastructure](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/) (paper)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/) (doc)

## Practice

### SLO error budget

99.9% monthly SLO. How many minutes downtime allowed in 30 days? Burn 50% budget in 2 days — ship or freeze?

**Expected evidence:** ~43 min/month; freeze risky releases.

### Design exercise: Observability & OpenTelemetry

Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines. Implement designOutline() returning non-empty values for: signals, contextPropagation, sampling. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with signals, contextPropagation, sampling plus an explicit failure mode or trade-off.

## Review prompts

- What question does each of metrics, traces, and logs answer?
- You have metrics and logs. What does a trace add that neither gives you?

## Build evidence

- **Structured logging package** — A structured logger with a request correlation id.
- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w.html)
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime.html)
