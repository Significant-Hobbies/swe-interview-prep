# Storage vs retrieval API

> Design blob store: PUT by id vs GET by tag. Which needs secondary index? Which is O(1) lookup?

Canonical: https://learn.significanthobbies.com/curriculum/drills/storage-vs-retrieval

Design blob store: PUT by id vs GET by tag. Which needs secondary index? Which is O(1) lookup?

## The mechanism

A storage engine is the layer that actually puts bytes on disk and finds them again. The defining choice is the write path: B-trees update pages in place (read-optimized), LSM trees append and merge (write-optimized). Everything else — WAL, indexes, caching — serves durability and lookup speed.

## Expected evidence

PUT/GET by id is primary key O(1); tag search needs inverted/secondary index.

## Hints

- Object id is content-addressed or assigned.
- Retrieval patterns drive indexes.

## Sources and practice

- [Designing Data-Intensive Applications (Kleppmann) — book site](https://dataintensive.net/)
- [The Log-Structured Merge-Tree (O'Neil et al.)](https://www.cs.umb.edu/~poneil/lsmtree.pdf)
- [SQLite — Write-Ahead Logging](https://www.sqlite.org/wal.html)
- [Study Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/storage-vs-retrieval)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
