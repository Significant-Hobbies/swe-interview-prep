# B-Tree

The balanced, disk-friendly tree behind most relational indexes.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

A B-tree is a wide, shallow tree sized to disk pages: each node holds many keys so the tree stays ~3-4 levels deep even for billions of rows. Reads are fast and in-place; writes do random page updates.

## Where it matters

PostgreSQL, MySQL/InnoDB, SQLite — the default index.

## Common mistakes

- Confusing B-tree (in-place, read-optimized) with LSM (append, write-optimized)
- Ignoring page splits and write amplification
- Forgetting that B-trees keep keys sorted, enabling range scans

## Primary sources

- [CMU 15-445 — Tree indexes](https://15445.courses.cs.cmu.edu/fall2023/notes/08-trees.pdf) (doc)

## Practice

### B-tree page split

Page holds 4 keys, insert 5th triggers split. After split how many keys in each page (order 5)?

**Expected evidence:** 2 keys in left, 2 in right, median promoted.

## Review prompts

- When would you choose an LSM tree over a B-tree?
- Why are B-tree nodes sized to disk pages?


## Prerequisites

- None assigned.

## Related concepts

- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree.html)
- [Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index.html)
- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
