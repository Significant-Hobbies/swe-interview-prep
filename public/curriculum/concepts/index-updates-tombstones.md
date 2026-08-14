# Index Updates & Tombstones

Deleting and updating vectors in a graph index without rebuilding it.

- Difficulty: advanced
- Tracks: Vector DB & ANN

## Mental model

A proximity graph has no cheap delete: removing a node severs the edges other nodes rely on for connectivity, so implementations mark it deleted and filter it at query time instead. Tombstones are therefore a debt — they still occupy memory, still get traversed, and gradually degrade both recall and latency until a compaction rebuilds the affected region. An update is a delete plus an insert, so a workload that rewrites embeddings frequently accumulates that debt much faster than its row count suggests.

## Where it matters

Any vector store backing mutable documents, and the reason re-embedding is usually a rebuild-and-swap.

## Common mistakes

- Assuming delete is O(1) and free; it is a filter plus deferred compaction
- Letting the tombstone ratio grow unbounded, so recall drifts down with no obvious cause
- Re-embedding a whole corpus in place rather than building a new index and swapping
- Measuring recall only on a freshly built index, which never shows the degradation

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Tombstones erode recall

Implement search(graph, deleted, entry, query, k, budget) — a greedy walk over an adjacency map. Visit at most `budget` nodes; tombstoned nodes (in `deleted`) are traversed and count against the budget but must NOT appear in results. Return the ids of up to k live nodes with the smallest |value - query|, best first.

**Expected evidence:** With tombstones present the same budget returns fewer live results.

## Review prompts

- Why can a proximity-graph index not simply remove a deleted node, and what does the tombstone cost you over time?


## Prerequisites

- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw)

## Related concepts

- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction)
- [Disk-Based ANN](https://learn.significanthobbies.com/curriculum/concepts/disk-based-ann)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
