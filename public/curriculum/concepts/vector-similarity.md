# Vector Similarity

Cosine, dot product, and L2 distance — how to score vector closeness.

- Difficulty: core
- Tracks: Vector DB & ANN

## Mental model

Cosine measures angle (direction), dot product measures angle and magnitude, L2 measures straight-line distance. On normalized vectors cosine and dot product rank identically, and L2 becomes a monotonic function of them.

## Where it matters

Every vector index exposes a metric choice; it must match the embedding model.

## Common mistakes

- Mixing distance metrics between indexing and querying
- Using dot product on un-normalized vectors and being surprised by magnitude bias
- Assuming the metric does not matter for the chosen index

## Primary sources

- [Pinecone — Vector similarity explained](https://www.pinecone.io/learn/vector-similarity/) (article)

## Practice

### Implement similarity metrics

Implement cosine similarity, dot product, and L2 distance. Show that on normalized vectors, cosine and dot product produce the same ranking.

**Expected evidence:** Three functions; a demonstration that normalized cosine == dot ranking.

## Review prompts

- When do cosine similarity and dot product give the same ranking?

## Build evidence

- **Hybrid search v0 in HighSignal** — Combine BM25 and vector retrieval with reciprocal rank fusion.
- **Brute-force vector index** — An exact nearest-neighbour index — the recall=1.0 baseline.

## Prerequisites

- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings)

## Related concepts

- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search)
- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
