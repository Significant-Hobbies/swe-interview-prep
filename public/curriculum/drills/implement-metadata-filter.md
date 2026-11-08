# Add metadata filtering to vector search

> Extend your brute-force index to support 'nearest WHERE field = value'. Implement both pre-filtering and post-filtering and compare results and timing.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-metadata-filter

Extend your brute-force index to support 'nearest WHERE field = value'. Implement both pre-filtering and post-filtering and compare results and timing.

## The mechanism

Real queries are 'nearest vectors WHERE tenant=X AND date>Y'. Pre-filtering shrinks the candidate set before ANN (accurate, can be slow); post-filtering runs ANN then drops misses (fast, can return too few). The hard part is doing it inside a graph index.

## Expected evidence

Filtered top-k that always returns k items when k qualify.

## Hints

- Post-filtering an ANN result can return fewer than k.
- Pre-filtering is exact but scans the filtered subset.

## Sources and practice

- [Pinecone — Filtering with metadata](https://www.pinecone.io/learn/vector-search-filtering/)
- [Weaviate — Filtered ANN search](https://weaviate.io/blog/speed-up-filtered-vector-search)
- [Study Metadata Filtering](https://learn.significanthobbies.com/curriculum/concepts/metadata-filtering)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-metadata-filter)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
