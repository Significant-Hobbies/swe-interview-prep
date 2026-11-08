# Decide the edge cache key

> Implement edgePolicy({ url, hasAuthCookie, varyHeaders, contentHashed }) returning { cacheable, ttlSeconds, key }. Never cache when hasAuthCookie is true (ttl 0). A content-hashed URL is immutable: ttl 31536000. Otherwise ttl 300. The key is the url plus each varyHeader appended as '|<header>' in the given order.

Canonical: https://learn.significanthobbies.com/curriculum/drills/cache-key-and-ttl

Implement edgePolicy({ url, hasAuthCookie, varyHeaders, contentHashed }) returning { cacheable, ttlSeconds, key }. Never cache when hasAuthCookie is true (ttl 0). A content-hashed URL is immutable: ttl 31536000. Otherwise ttl 300. The key is the url plus each varyHeader appended as '|<header>' in the given order.

## The mechanism

A CDN is a cache hierarchy whose top tier is geographic: the edge answers what it can, a shield tier absorbs the misses so the origin sees one request instead of one per POP, and only genuine misses reach you. The hard problem is the same as any cache — invalidation — and the practical answer is usually to avoid it: content-hashed URLs make every change a new key with an immutable, long TTL, so nothing ever needs purging. Reserve explicit purge for the cases where the URL genuinely cannot change.

## Expected evidence

content-hashed -> one year; authed -> not cacheable; otherwise 5 minutes

## Hints

- Personalised responses must be excluded before any TTL question is asked.
- Immutability is what makes a one-year TTL safe — a change produces a different URL, so nothing needs purging.

## Sources and practice


- [Study CDN & Edge Delivery](https://learn.significanthobbies.com/curriculum/concepts/cdn-edge-delivery)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/cache-key-and-ttl)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
