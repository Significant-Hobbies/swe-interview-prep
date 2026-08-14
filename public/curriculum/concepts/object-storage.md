# Object Storage

S3-style blob storage: cheap, durable, high-latency, immutable objects.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

Object storage (S3/R2) is infinite, cheap, durable bytes — but with ~tens-of-ms latency and no in-place edits. Modern systems like Turbopuffer put cold data here and keep a hot cache in front. Storage and compute separate.

## Where it matters

S3, Cloudflare R2, GCS; the durable layer of object-storage-first databases.

## Common mistakes

- Treating object storage like a low-latency disk
- Many tiny objects instead of batched segment files
- Ignoring request cost (GETs/PUTs are billed)

## Primary sources

- [Turbopuffer — Architecture](https://turbopuffer.com/architecture) (article)

## Practice

### Object key layout

Keys userId/timestamp/uuid vs flat uuid. Name one hot-partition risk and one listing benefit.

**Expected evidence:** Prefix listing per user; hot prefix if time-ordered without sharding.

## Review prompts

- Why can't you treat object storage like a local disk?

## Build evidence

- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.

## Prerequisites

- None assigned.

## Related concepts

- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching)
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
