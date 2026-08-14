# Caching

Cache-aside, write-through, eviction policies.

- Difficulty: core
- Tracks: Distributed Systems, Backend

## Mental model

A cache trades memory and staleness for speed. The hard parts are not the hit — they are invalidation, the stampede when a hot key expires, and deciding how stale is acceptable.

## Where it matters

Redis/Memcached, CDN edges, HTTP caching.

## Common mistakes

- Cache-aside with no stampede protection on a hot key
- No TTL, so stale data lives forever
- Caching per-user data in a shared key

## Primary sources

- [HTTP caching (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) (doc)

## Practice

### Cache stampede

Hot key expires, 1000 requests miss together. Name two mitigations.

**Expected evidence:** Probabilistic early expiry, request coalescing/singleflight, mutex per key.

## Review prompts

- What is a cache stampede and how do you prevent it?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle)

## Related concepts

- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage)
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing)

## Learning paths

- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
