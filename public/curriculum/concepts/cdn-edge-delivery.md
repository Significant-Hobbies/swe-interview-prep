# CDN & Edge Delivery

Cache hierarchy, origin shield, and invalidation versus TTL at the edge.

- Difficulty: core
- Tracks: System Design

## Mental model

A CDN is a cache hierarchy whose top tier is geographic: the edge answers what it can, a shield tier absorbs the misses so the origin sees one request instead of one per POP, and only genuine misses reach you. The hard problem is the same as any cache — invalidation — and the practical answer is usually to avoid it: content-hashed URLs make every change a new key with an immutable, long TTL, so nothing ever needs purging. Reserve explicit purge for the cases where the URL genuinely cannot change.

## Where it matters

Static asset delivery, video segments, and the first thing to check when origin load spikes without a traffic increase.

## Common mistakes

- Relying on purge as the primary strategy, then discovering it is eventually consistent across POPs
- Caching a personalised response because the Vary and Cache-Control headers did not say otherwise
- No origin shield, so a cold cache means every POP stampedes the origin simultaneously
- Short TTLs everywhere as a substitute for thinking about cache keys

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Decide the edge cache key

Implement edgePolicy({ url, hasAuthCookie, varyHeaders, contentHashed }) returning { cacheable, ttlSeconds, key }. Never cache when hasAuthCookie is true (ttl 0). A content-hashed URL is immutable: ttl 31536000. Otherwise ttl 300. The key is the url plus each varyHeader appended as '| ' in the given order.

**Expected evidence:** content-hashed -> one year; authed -> not cacheable; otherwise 5 minutes

## Review prompts

- Why do content-hashed URLs with a one-year TTL beat a short TTL plus purge-on-deploy?


## Prerequisites

- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching.html)

## Related concepts

- [Streaming Media](https://learn.significanthobbies.com/curriculum/concepts/streaming-media.html)
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html)

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
