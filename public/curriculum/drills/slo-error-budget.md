# SLO error budget

> 99.9% monthly SLO. How many minutes downtime allowed in 30 days? Burn 50% budget in 2 days — ship or freeze?

Canonical: https://learn.significanthobbies.com/curriculum/drills/slo-error-budget

99.9% monthly SLO. How many minutes downtime allowed in 30 days? Burn 50% budget in 2 days — ship or freeze?

## The mechanism

The three pillars answer different questions: metrics say something is wrong, traces say where, logs say why. A structured log plus a request id is what stitches them together. OpenTelemetry is the reason that stitching survives a service hop — it standardises the signals and, more importantly, propagates trace context across process boundaries, so instrumentation is portable and a trace does not end at the edge of the service that started it.

## Expected evidence

~43 min/month; freeze risky releases.

## Hints

- Budget = 1 − SLO over window.
- Fast burn → stop deploying.

## Sources and practice

- [Site Reliability Engineering — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Canopy: An End-to-End Performance Tracing And Analysis System (SOSP '17)](https://www.microsoft.com/en-us/research/publication/canopy-an-end-to-end-performance-tracing-and-analysis-system/)
- [USENIX SREcon22 Asia/Pacific — OpenTelemetry and Observability: What, Why, and Why Now?](https://www.youtube.com/watch?v=sn6MWZPED24)
- [Dapper, a Large-Scale Distributed Systems Tracing Infrastructure](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Study Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/slo-error-budget)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
