# Compaction

Merging sorted runs to reclaim space and bound read amplification.

- Difficulty: advanced
- Tracks: Databases & Storage

## Mental model

An LSM tree keeps producing sorted files; without compaction reads get slower and deleted data lingers. Compaction merges files, drops tombstones, and bounds read amplification — at the cost of write amplification and IO spikes.

## Where it matters

RocksDB/Cassandra compaction strategies; segment merges in search engines.

## Common mistakes

- Ignoring the write-amplification cost of compaction
- Not understanding leveled vs size-tiered strategies
- Compaction storms that starve foreground traffic

## Primary sources

- [RocksDB Compaction](https://github.com/facebook/rocksdb/wiki/Compaction) (doc)

## Practice

### LSM compaction levels

L0 has 4 SSTables, threshold 4 triggers compaction to L1. Why not compact every write?

**Expected evidence:** Compaction is expensive; batching amortizes I/O; reads use bloom + levels.

## Review prompts

- What does compaction cost, and what does it buy?

## Build evidence

- **Toy LSM tree** — A minimal LSM storage engine: memtable, SSTables, compaction.

## Prerequisites

- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree)

## Related concepts

- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
