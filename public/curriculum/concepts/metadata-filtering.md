# Metadata Filtering

Combining vector search with structured predicates (tenant, date, tags).

- Difficulty: core
- Tracks: Vector DB & ANN

## Mental model

Real queries are 'nearest vectors WHERE tenant=X AND date>Y'. Pre-filtering shrinks the candidate set before ANN (accurate, can be slow); post-filtering runs ANN then drops misses (fast, can return too few). The hard part is doing it inside a graph index.

## Where it matters

Every production vector DB; critical for multi-tenant RAG.

## Common mistakes

- Post-filtering an HNSW result and returning fewer than k items
- Treating filters as an afterthought to the index design
- Ignoring multi-tenancy isolation in a shared index

## Primary sources

- [Pinecone — Filtering with metadata](https://www.pinecone.io/learn/vector-search-filtering/) (doc)
- [Weaviate — Filtered ANN search](https://weaviate.io/blog/speed-up-filtered-vector-search) (doc)

## Practice

### Add metadata filtering to vector search

Extend your brute-force index to support 'nearest WHERE field = value'. Implement both pre-filtering and post-filtering and compare results and timing.

**Expected evidence:** Filtered top-k that always returns k items when k qualify.

## Review prompts

- Compare pre-filtering and post-filtering in vector search.

## Build evidence

- **Metadata filtering for vector search** — Add structured predicate filtering to vector search.

## Prerequisites

- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db.html)

## Related concepts

- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw.html)
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
