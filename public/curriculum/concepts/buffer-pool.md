# Buffer Pool

The database's own page cache — why it does not simply trust the OS.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

A database manages its own page cache because it knows things the OS cannot: which pages a query will touch next, which are dirty and pinned by an open transaction, and that a sequential scan should not evict the working set. That last point is why plain LRU is wrong for a database — one big scan touches every page once and flushes everything useful, so real systems use LRU-K or clock-sweep variants that require a second reference before promoting a page.

## Where it matters

The first thing to size on any database server, and the explanation for a cache hit rate that collapses after a nightly batch job.

## Common mistakes

- Assuming the OS page cache is equivalent — it cannot honour pin counts or write ordering for recovery
- Plain LRU, which a single sequential scan pollutes end to end
- Sizing the pool to fill RAM and leaving nothing for sorts, hash joins, and the OS
- Ignoring that a dirty page cannot be evicted until its log record is durable

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Why LRU-K survives a scan

Implement simulate(capacity, accesses, policy) returning the number of hits. policy is 'lru' or 'lru2'. Under 'lru2' a page is only promoted into the resident set on its SECOND access — a page seen once goes to a probationary list and is evicted before any twice-seen page. Evict the least-recently-used within each tier, probationary first.

**Expected evidence:** A hot working set plus a long one-shot scan: lru2 keeps the working set, lru loses it.

## Review prompts

- A nightly report scans a large table and the morning cache hit rate collapses. What did plain LRU do, and how does LRU-K prevent it?


## Prerequisites

- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval)

## Related concepts

- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction)
- [Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
