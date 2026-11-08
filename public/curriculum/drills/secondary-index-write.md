# Secondary index write cost

> Table with 3 secondary indexes. One INSERT touches how many index structures?

Canonical: https://learn.significanthobbies.com/curriculum/drills/secondary-index-write

Table with 3 secondary indexes. One INSERT touches how many index structures?

## The mechanism

A secondary index is an extra sorted lookup that maps a non-primary-key value (like email) back to the rows that match. Reads on that value get fast; writes get a little slower because the index also has to update. Every index is a tradeoff — only add the ones queries actually need.

## Expected evidence

Primary + 3 secondaries = 4 writes (plus WAL).

## Hints

- Each index is another B-tree insert.
- Indexes speed reads, tax writes.

## Sources and practice

- [Database index (Wikipedia)](https://en.wikipedia.org/wiki/Database_index)
- [Study Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/secondary-index-write)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
