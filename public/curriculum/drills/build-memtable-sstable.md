# Build a memtable + SSTable flush

> Implement an in-memory memtable that flushes to an immutable sorted file (SSTable). Support reads that merge memtable and SSTables; deletes as tombstones.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-memtable-sstable

Implement an in-memory memtable that flushes to an immutable sorted file (SSTable). Support reads that merge memtable and SSTables; deletes as tombstones.

## The mechanism

An LSM tree turns random writes into sequential ones: buffer writes in an in-memory memtable, flush to immutable sorted files (SSTables), and merge them in the background. Writes are fast; reads may touch several files (bloom filters help).

## Expected evidence

Writes go to the memtable; reads see the latest value across files.

## Hints

- SSTables are immutable and sorted.
- A read may need to check several files newest-first.

## Sources and practice

- [RocksDB Wiki — LSM overview](https://github.com/facebook/rocksdb/wiki/RocksDB-Overview)
- [Study LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-memtable-sstable)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
