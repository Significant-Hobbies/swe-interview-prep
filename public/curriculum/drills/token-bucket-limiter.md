# Token bucket rate limiter

> Implement makeLimiter(capacity, refillPerSecond) returning allow(nowMs) -> boolean. Tokens refill continuously at refillPerSecond, capped at capacity; the bucket starts full. Each allowed call consumes one token. Do not refill in discrete ticks.

Canonical: https://learn.significanthobbies.com/curriculum/drills/token-bucket-limiter

Implement makeLimiter(capacity, refillPerSecond) returning allow(nowMs) -> boolean. Tokens refill continuously at refillPerSecond, capped at capacity; the bucket starts full. Each allowed call consumes one token. Do not refill in discrete ticks.

## The mechanism

Fixed windows are simple and wrong at the boundary — a client can send a full quota at the end of one window and again at the start of the next, so the observed rate doubles. Token bucket fixes that by refilling continuously, which also permits a deliberate burst up to the bucket size. The hard part is distribution: a per-node limit multiplies by node count, and a shared counter adds a round trip to the hot path, so real systems either shard the budget per node or accept approximate global limits with periodic reconciliation.

## Expected evidence

capacity 2, refill 1/s: two immediate calls allowed, third denied, allowed again one second later.

## Hints

- Refill by elapsed time since the last call: tokens += (now - last)/1000 * rate, clamped to capacity.
- The burst allowance is the capacity — that is the deliberate difference from a fixed window.

## Sources and practice


- [Study Rate Limiter Design](https://learn.significanthobbies.com/curriculum/concepts/rate-limiter-design)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/token-bucket-limiter)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
