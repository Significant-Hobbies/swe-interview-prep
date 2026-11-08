# Top-k with a bounded heap

> Given a stream of (id, score) pairs, return the top-k by score using a size-k min-heap — without sorting everything.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-topk-heap

Given a stream of (id, score) pairs, return the top-k by score using a size-k min-heap — without sorting everything.

## The mechanism

Top-k is a bounded selection problem: keep a size-k heap whose root is the current worst survivor and evict that root when something better arrives. Ranking by similarity (higher is better) the root is the smallest, so it is a min-heap; ranking by distance (lower is better) the root is the largest, so it is a max-heap. Exact search scans everything; ANN scans a clever subset.

## Expected evidence

Correct top-k in O(n log k) time and O(k) space.

## Hints

- Keep a min-heap of size k; the root is the weakest kept item.
- Replace the root when a better score arrives.

## Sources and practice

- [Nearest neighbor search (Wikipedia)](https://en.wikipedia.org/wiki/Nearest_neighbor_search)
- [Study Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-topk-heap)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
