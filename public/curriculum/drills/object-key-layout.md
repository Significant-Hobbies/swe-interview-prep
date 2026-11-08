# Object key layout

> Keys userId/timestamp/uuid vs flat uuid. Name one hot-partition risk and one listing benefit.

Canonical: https://learn.significanthobbies.com/curriculum/drills/object-key-layout

Keys userId/timestamp/uuid vs flat uuid. Name one hot-partition risk and one listing benefit.

## The mechanism

Object storage (S3/R2) is infinite, cheap, durable bytes — but with ~tens-of-ms latency and no in-place edits. Modern systems like Turbopuffer put cold data here and keep a hot cache in front. Storage and compute separate.

## Expected evidence

Prefix listing per user; hot prefix if time-ordered without sharding.

## Hints

- S3 listing is prefix-based.
- Shard prefixes for hot tenants.

## Sources and practice

- [Turbopuffer — Architecture](https://turbopuffer.com/architecture)
- [Study Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/object-key-layout)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
