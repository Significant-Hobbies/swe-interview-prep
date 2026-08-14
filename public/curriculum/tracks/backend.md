# Backend

Production backend strength: HTTP, API design, auth, rate limiting, idempotency, queues, jobs, caching, and observability.

This track contains 16 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month) — Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime) — Build one cross-cutting mental model for V8, JVM, Go, BEAM, .NET CLR, vLLM, SGLang, Cloudflare Workers, and wasmtime.
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape) — Get a working mental model of every major systems-software domain — LLMs, DBs, streaming, game engines, containers, browsers, compilers, OS, networking, distributed, build, crypto.
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w) — Turn backend, client, UX, real-time, interactive, analytics, and distribution skills into one complete product.

## Concepts

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle) (intro) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [API Keys](https://learn.significanthobbies.com/curriculum/concepts/api-keys) (core) — Issuing, hashing, scoping, and rotating keys for machine clients.
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting) (core) — Token bucket, leaky bucket, sliding window.
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency) (core) — Idempotency keys and dedup windows for safe retries of mutations.
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq) (core) — Backoff + jitter, poison messages, dead-letter queues.
- [Webhooks](https://learn.significanthobbies.com/curriculum/concepts/webhooks) (core) — Outbound event delivery: signing, retries, idempotent receivers.
- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs) (core) — Offloading slow work to workers: scheduling, concurrency, visibility.
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching) (core) — Cache-aside, write-through, eviction policies.
- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues) (core) — Kafka, SQS, exactly-once vs at-least-once.
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics) (core) — Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.
- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design) (core) — REST, gRPC, versioning, pagination.
- [Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems) (core) — OAuth2, JWT, session, RBAC.
- [Payments](https://learn.significanthobbies.com/curriculum/concepts/ecommerce-payments) (core) — Idempotency, sagas, double-entry.
- [Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers) (core) — Backoff, jitter, budgets, and breakers — retrying without turning a blip into an outage.
- [Web Security Basics](https://learn.significanthobbies.com/curriculum/concepts/web-security-basics) (core) — XSS, CSRF, SQL injection, and CORS — the injection and confused-deputy bugs that keep recurring.
- [Pagination](https://learn.significanthobbies.com/curriculum/concepts/pagination) (core) — Offset versus cursor pagination, stable ordering, and why deep pages get expensive.
