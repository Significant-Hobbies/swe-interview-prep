# Rate Limiting

Token bucket, leaky bucket, sliding window.

- Difficulty: core
- Tracks: Backend

## Mental model

Rate limiting protects a shared resource from any one caller. Token bucket is the workhorse: tokens refill at a steady rate, each request spends one, an empty bucket means 429 — allowing bursts up to the bucket size.

## Where it matters

API gateways, every public API.

## Common mistakes

- Fixed-window counters that allow 2x burst at the boundary
- Limiting per-server instead of globally in a cluster
- No Retry-After header on 429 responses

## Primary sources

- [429 Too Many Requests (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429) (doc)

## Practice

### Implement a token-bucket rate limiter

Implement a token bucket: tokens refill at a fixed rate, each request spends one, an empty bucket returns 429 with Retry-After.

**Expected evidence:** Allows bursts up to bucket size, then throttles to the refill rate.

## Review prompts

- How does a token bucket differ from a fixed-window counter?

## Build evidence

- **Reusable rate limiter** — A token-bucket rate limiter usable as middleware.

## Prerequisites

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle.html)

## Related concepts

- [API Keys](https://learn.significanthobbies.com/curriculum/concepts/api-keys.html)
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
