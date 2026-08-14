# HTTP Lifecycle

DNS → TCP/TLS → request → response: status codes, headers, keep-alive.

- Difficulty: intro
- Tracks: Backend

## Mental model

An HTTP request is a journey: resolve DNS, open a TCP connection, negotiate TLS, send the request, the server routes and responds, the connection is reused or closed. Latency and failures hide in each hop.

## Where it matters

Every web service; the substrate under API design.

## Common mistakes

- Confusing 401 (unauthenticated) with 403 (unauthorized)
- Ignoring connection reuse and paying TLS cost per request
- Treating all 5xx as retryable and all 4xx as not

## Primary sources

- [MDN — An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) (doc)

## Practice

### Idempotent POST retry

POST returns 503 after 30s. Client retries. Safe without Idempotency-Key? When is 409 vs 200 on duplicate?

**Expected evidence:** Unsafe without key; Idempotency-Key makes retry safe; duplicate returns cached 200.

## Review prompts

- What is the difference between HTTP 401 and 403?


## Prerequisites

- None assigned.

## Related concepts

- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design)
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w)
