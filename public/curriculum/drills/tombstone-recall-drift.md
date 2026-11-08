# Tombstones erode recall

> Implement search(graph, deleted, entry, query, k, budget) — a greedy walk over an adjacency map. Visit at most `budget` nodes; tombstoned nodes (in `deleted`) are traversed and count against the budget but must NOT appear in results. Return the ids of up to k live nodes with the smallest |value - query|, best first.

Canonical: https://learn.significanthobbies.com/curriculum/drills/tombstone-recall-drift

Implement search(graph, deleted, entry, query, k, budget) — a greedy walk over an adjacency map. Visit at most `budget` nodes; tombstoned nodes (in `deleted`) are traversed and count against the budget but must NOT appear in results. Return the ids of up to k live nodes with the smallest |value - query|, best first.

## The mechanism

A proximity graph has no cheap delete: removing a node severs the edges other nodes rely on for connectivity, so implementations mark it deleted and filter it at query time instead. Tombstones are therefore a debt — they still occupy memory, still get traversed, and gradually degrade both recall and latency until a compaction rebuilds the affected region. An update is a delete plus an insert, so a workload that rewrites embeddings frequently accumulates that debt much faster than its row count suggests.

## Expected evidence

With tombstones present the same budget returns fewer live results.

## Hints

- A deleted node still consumes budget — that is the cost tombstones impose.
- Filter on output, not on traversal; skipping them entirely would disconnect the graph.

## Sources and practice


- [Study Index Updates & Tombstones](https://learn.significanthobbies.com/curriculum/concepts/index-updates-tombstones)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/tombstone-recall-drift)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
