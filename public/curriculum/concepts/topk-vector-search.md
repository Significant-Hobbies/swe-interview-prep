# Top-k Vector Search

Returning the k nearest vectors to a query, exact or approximate.

- Difficulty: core
- Tracks: Vector DB & ANN

## Mental model

Top-k is a bounded selection problem: keep a size-k heap whose root is the current worst survivor and evict that root when something better arrives. Ranking by similarity (higher is better) the root is the smallest, so it is a min-heap; ranking by distance (lower is better) the root is the largest, so it is a max-heap. Exact search scans everything; ANN scans a clever subset.


## Common mistakes

- Sorting all scores instead of using a k-sized heap
- Confusing recall@k (quality) with k (result count)

## Primary sources

- [Nearest neighbor search (Wikipedia)](https://en.wikipedia.org/wiki/Nearest_neighbor_search) (doc)

## Practice

### Top-k with a bounded heap

Given a stream of (id, score) pairs, return the top-k by score using a size-k min-heap — without sorting everything.

**Expected evidence:** Correct top-k in O(n log k) time and O(k) space.

## Review prompts

- How do you return top-k without sorting all n scores?

## Build evidence

- **Brute-force vector index** — An exact nearest-neighbour index — the recall=1.0 baseline.

## Prerequisites

- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity)

## Related concepts

- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db)
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
