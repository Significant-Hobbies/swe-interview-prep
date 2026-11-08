# LSM compaction levels

> L0 has 4 SSTables, threshold 4 triggers compaction to L1. Why not compact every write?

Canonical: https://learn.significanthobbies.com/curriculum/drills/lsm-compaction-levels

L0 has 4 SSTables, threshold 4 triggers compaction to L1. Why not compact every write?

## The mechanism

An LSM tree keeps producing sorted files; without compaction reads get slower and deleted data lingers. Compaction merges files, drops tombstones, and bounds read amplification — at the cost of write amplification and IO spikes.

## Expected evidence

Compaction is expensive; batching amortizes I/O; reads use bloom + levels.

## Hints

- L0 may overlap key ranges.
- Tiered compaction trades write amp for read amp.

## Sources and practice

- [RocksDB Compaction](https://github.com/facebook/rocksdb/wiki/Compaction)
- [Study Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/lsm-compaction-levels)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
