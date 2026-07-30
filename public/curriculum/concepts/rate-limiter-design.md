# Rate Limiter Design

Token bucket versus sliding window, and making a limiter work across many nodes.

- Difficulty: core
- Tracks: System Design

## Mental model

Fixed windows are simple and wrong at the boundary — a client can send a full quota at the end of one window and again at the start of the next, so the observed rate doubles. Token bucket fixes that by refilling continuously, which also permits a deliberate burst up to the bucket size. The hard part is distribution: a per-node limit multiplies by node count, and a shared counter adds a round trip to the hot path, so real systems either shard the budget per node or accept approximate global limits with periodic reconciliation.

## Where it matters

Every public API, and the control that keeps one noisy tenant from consuming a shared quota.

## Common mistakes

- Fixed windows without smoothing, allowing 2x the intended rate across a boundary
- Enforcing per-node limits and being surprised the global rate is N times higher
- A synchronous shared counter on the request path, making the limiter itself the bottleneck
- Returning 429 without Retry-After, so well-behaved clients retry immediately and make it worse

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Token bucket rate limiter

Implement makeLimiter(capacity, refillPerSecond) returning allow(nowMs) -> boolean. Tokens refill continuously at refillPerSecond, capped at capacity; the bucket starts full. Each allowed call consumes one token. Do not refill in discrete ticks.

**Expected evidence:** capacity 2, refill 1/s: two immediate calls allowed, third denied, allowed again one second later.

## Review prompts

- A fixed-window limiter allows 100 requests per minute, yet a client sustains 200 in a sixty-second span. Explain the mechanism and what fixes it.


## Prerequisites

- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html)
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)

## Related concepts

- [Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers.html)
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html)

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
