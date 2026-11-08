# Why LRU-K survives a scan

> Implement simulate(capacity, accesses, policy) returning the number of hits. policy is 'lru' or 'lru2'. Under 'lru2' a page is only promoted into the resident set on its SECOND access — a page seen once goes to a probationary list and is evicted before any twice-seen page. Evict the least-recently-used within each tier, probationary first.

Canonical: https://learn.significanthobbies.com/curriculum/drills/lru-k-eviction

Implement simulate(capacity, accesses, policy) returning the number of hits. policy is 'lru' or 'lru2'. Under 'lru2' a page is only promoted into the resident set on its SECOND access — a page seen once goes to a probationary list and is evicted before any twice-seen page. Evict the least-recently-used within each tier, probationary first.

## The mechanism

A database manages its own page cache because it knows things the OS cannot: which pages a query will touch next, which are dirty and pinned by an open transaction, and that a sequential scan should not evict the working set. That last point is why plain LRU is wrong for a database — one big scan touches every page once and flushes everything useful, so real systems use LRU-K or clock-sweep variants that require a second reference before promoting a page.

## Expected evidence

A hot working set plus a long one-shot scan: lru2 keeps the working set, lru loses it.

## Hints

- Track access counts separately from recency; the tier is decided by count, the victim by recency.
- The point of the second test is that a scan of never-repeated pages should not evict the hot set.

## Sources and practice


- [Study Buffer Pool](https://learn.significanthobbies.com/curriculum/concepts/buffer-pool)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/lru-k-eviction)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
