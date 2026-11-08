# Cache stampede

> Hot key expires, 1000 requests miss together. Name two mitigations.

Canonical: https://learn.significanthobbies.com/curriculum/drills/cache-stampede

Hot key expires, 1000 requests miss together. Name two mitigations.

## The mechanism

A cache trades memory and staleness for speed. The hard parts are not the hit — they are invalidation, the stampede when a hot key expires, and deciding how stale is acceptable.

## Expected evidence

Probabilistic early expiry, request coalescing/singleflight, mutex per key.

## Hints

- TTL jitter spreads expiry.
- One backend fetch serves many waiters.

## Sources and practice

- [HTTP caching (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [Study Caching](https://learn.significanthobbies.com/curriculum/concepts/caching)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/cache-stampede)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
