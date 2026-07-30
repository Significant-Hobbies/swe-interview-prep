# Storage Engines

B-tree vs LSM, indexing, WAL.

- Difficulty: advanced
- Tracks: Databases & Storage

## Mental model

A storage engine is the layer that actually puts bytes on disk and finds them again. The defining choice is the write path: B-trees update pages in place (read-optimized), LSM trees append and merge (write-optimized). Everything else — WAL, indexes, caching — serves durability and lookup speed.


## Common mistakes

- Picking an engine without knowing the read/write ratio of the workload
- Ignoring write amplification and its effect on SSD lifetime
- Forgetting that every secondary index is extra write cost

## Primary sources

- [Designing Data-Intensive Applications (Kleppmann) — book site](https://dataintensive.net/) (course)
- [The Log-Structured Merge-Tree (O'Neil et al.)](https://www.cs.umb.edu/~poneil/lsmtree.pdf) (paper)
- [SQLite — Write-Ahead Logging](https://www.sqlite.org/wal.html) (doc)

## Practice

### Storage vs retrieval API

Design blob store: PUT by id vs GET by tag. Which needs secondary index? Which is O(1) lookup?

**Expected evidence:** PUT/GET by id is primary key O(1); tag search needs inverted/secondary index.

## Review prompts

- B-tree versus LSM: which one has read amplification and which has write amplification, and where does each come from?


## Prerequisites

- None assigned.

## Related concepts

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree.html)
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree.html)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
