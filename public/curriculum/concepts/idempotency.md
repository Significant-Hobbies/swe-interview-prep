# Idempotency

Idempotency keys and dedup windows for safe retries of mutations.

- Difficulty: core
- Tracks: Backend

## Mental model

Networks make retries inevitable, and retrying a POST can charge a card twice. An idempotency key lets the client say 'this is the same operation' — the server stores the first result and replays it for duplicates.

## Where it matters

Stripe payments, any mutating API that clients retry.

## Common mistakes

- Assuming GET-only idempotency and leaving POST unsafe
- No expiry on stored idempotency keys
- Race between two concurrent requests with the same key

## Primary sources

- [Stripe — Designing robust APIs with idempotency](https://stripe.com/blog/idempotency) (article)

## Practice

### Implement idempotency keys

Add idempotency-key handling to a mutating endpoint: first request executes and stores the result; duplicates replay the stored result.

**Expected evidence:** Two identical requests with the same key cause one effect.

## Review prompts

- Why are idempotency keys needed for POST endpoints?


## Prerequisites

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle)

## Related concepts

- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq)
- [Payments](https://learn.significanthobbies.com/curriculum/concepts/ecommerce-payments)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
