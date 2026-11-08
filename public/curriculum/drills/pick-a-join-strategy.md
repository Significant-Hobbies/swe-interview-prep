# Pick the join the planner should pick

> Implement chooseJoin({ leftRows, rightRows, leftSorted, rightSorted, hasIndexOnRight, memoryRows }) returning 'nested-loop', 'hash', or 'merge'. Rules: if both inputs are already sorted on the key, merge. Otherwise if the smaller side exceeds memoryRows, fall back to merge (hash would spill). Otherwise if the right side has an index and the left is small (<= 100 rows), nested-loop. Otherwise hash.

Canonical: https://learn.significanthobbies.com/curriculum/drills/pick-a-join-strategy

Implement chooseJoin({ leftRows, rightRows, leftSorted, rightSorted, hasIndexOnRight, memoryRows }) returning 'nested-loop', 'hash', or 'merge'. Rules: if both inputs are already sorted on the key, merge. Otherwise if the smaller side exceeds memoryRows, fall back to merge (hash would spill). Otherwise if the right side has an index and the left is small (<= 100 rows), nested-loop. Otherwise hash.

## The mechanism

Three strategies with different shapes: nested-loop wins when one side is tiny or an index makes lookups cheap, hash join wins on large unsorted equijoins if the build side fits in memory, merge join wins when both inputs already arrive sorted. The planner picks using estimated row counts, which is why join performance collapses on bad statistics — a cardinality estimate off by 100x picks a nested loop over a hash join and turns seconds into hours.

## Expected evidence

chooseJoin({leftRows:10,rightRows:1e6,leftSorted:false,rightSorted:false,hasIndexOnRight:true,memoryRows:1e5}) -> 'nested-loop'

## Hints

- Check the sorted case first — it is free and beats everything.
- 'Smaller side' is the build side for a hash join; that is the one that has to fit.

## Sources and practice


- [Study Join Algorithms](https://learn.significanthobbies.com/curriculum/concepts/join-algorithms)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/pick-a-join-strategy)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
