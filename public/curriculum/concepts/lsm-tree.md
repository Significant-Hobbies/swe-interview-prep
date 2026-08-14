# LSM Tree

Log-structured merge tree: write-optimized storage via sorted runs.

- Difficulty: advanced
- Tracks: Databases & Storage

## Mental model

An LSM tree turns random writes into sequential ones: buffer writes in an in-memory memtable, flush to immutable sorted files (SSTables), and merge them in the background. Writes are fast; reads may touch several files (bloom filters help).

## Where it matters

RocksDB, Cassandra, LevelDB, ScyllaDB; the write-heavy storage engine.

## Common mistakes

- Ignoring read amplification across SSTable levels
- No bloom filters, so every read scans every file
- Forgetting that deletes are tombstones, not removals

## Primary sources

- [RocksDB Wiki — LSM overview](https://github.com/facebook/rocksdb/wiki/RocksDB-Overview) (doc)

## Practice

### Build a memtable + SSTable flush

Implement an in-memory memtable that flushes to an immutable sorted file (SSTable). Support reads that merge memtable and SSTables; deletes as tombstones.

**Expected evidence:** Writes go to the memtable; reads see the latest value across files.

## Review prompts

- When would you choose an LSM tree over a B-tree?
- Why can reads be slow in an LSM tree, and what helps?

## Build evidence

- **Toy LSM tree** — A minimal LSM storage engine: memtable, SSTables, compaction.

## Prerequisites

- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal)

## Related concepts

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree)
- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
