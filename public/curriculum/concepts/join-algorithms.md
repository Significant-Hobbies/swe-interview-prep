# Join Algorithms

Nested-loop, hash, and merge joins — and why cardinality estimates decide which one you get.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

Three strategies with different shapes: nested-loop wins when one side is tiny or an index makes lookups cheap, hash join wins on large unsorted equijoins if the build side fits in memory, merge join wins when both inputs already arrive sorted. The planner picks using estimated row counts, which is why join performance collapses on bad statistics — a cardinality estimate off by 100x picks a nested loop over a hash join and turns seconds into hours.

## Where it matters

The single most common source of a query that was fast in staging and unusable in production.

## Common mistakes

- Blaming the join when the real problem is a stale or missing statistic feeding the estimate
- Assuming hash join is always fastest; it degrades badly when the build side spills to disk
- Reading EXPLAIN's estimated rows as measured rows — run EXPLAIN ANALYZE to see both
- Adding an index to fix a join without checking whether the planner will actually choose it

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Pick the join the planner should pick

Implement chooseJoin({ leftRows, rightRows, leftSorted, rightSorted, hasIndexOnRight, memoryRows }) returning 'nested-loop', 'hash', or 'merge'. Rules: if both inputs are already sorted on the key, merge. Otherwise if the smaller side exceeds memoryRows, fall back to merge (hash would spill). Otherwise if the right side has an index and the left is small (<= 100 rows), nested-loop. Otherwise hash.

**Expected evidence:** chooseJoin({leftRows:10,rightRows:1e6,leftSorted:false,rightSorted:false,hasIndexOnRight:true,memoryRows:1e5}) -> 'nested-loop'

## Review prompts

- A query was fast in staging and unusable in production with the same plan shape. Why do cardinality estimates explain this more often than the join algorithm itself?


## Prerequisites

- [Query Execution & Optimization](https://learn.significanthobbies.com/curriculum/concepts/query-execution-optimization)

## Related concepts

- [Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index)
- [Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
