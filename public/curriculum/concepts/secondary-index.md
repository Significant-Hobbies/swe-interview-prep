# Secondary Indexes

Extra indexes for non-primary-key lookups, and what they cost on writes.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

A secondary index is an extra sorted lookup that maps a non-primary-key value (like email) back to the rows that match. Reads on that value get fast; writes get a little slower because the index also has to update. Every index is a tradeoff — only add the ones queries actually need.



## Primary sources

- [Database index (Wikipedia)](https://en.wikipedia.org/wiki/Database_index) (doc)

## Practice

### Secondary index write cost

Table with 3 secondary indexes. One INSERT touches how many index structures?

**Expected evidence:** Primary + 3 secondaries = 4 writes (plus WAL).

## Review prompts

- What is a covering index, and how does it change the cost of a query?


## Prerequisites

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree.html)

## Related concepts

- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval.html)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
