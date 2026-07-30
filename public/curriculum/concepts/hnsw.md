# HNSW

Hierarchical Navigable Small World graphs — the dominant ANN index.

- Difficulty: advanced
- Tracks: Vector DB & ANN

## Mental model

HNSW builds a layered proximity graph: sparse upper layers for long hops, dense lower layers for fine search. A query greedily walks toward the nearest neighbour, descending layers, so it touches a small neighbourhood instead of the whole set. Malkov & Yashunin report polylogarithmic search cost empirically — it is a measured scaling, not a proven bound.

## Where it matters

Default index in Qdrant, Weaviate, pgvector, Lucene/Elasticsearch kNN.

## Common mistakes

- Tuning efSearch/efConstruction blindly without a recall curve
- Ignoring that HNSW is memory-hungry and hard to update/delete
- Expecting exact results — it is approximate by design

## Primary sources

- [Efficient and robust ANN using HNSW graphs (Malkov & Yashunin)](https://arxiv.org/abs/1603.09320) (paper)

## Practice

### Explain HNSW search on paper

Draw a 3-layer HNSW graph and trace a query: which layer it enters, how it greedily hops, when it descends, and where efSearch widens the search.

**Expected evidence:** A diagram + walkthrough showing O(log n) traversal instead of O(n) scan.

## Review prompts

- What do the layers in an HNSW graph do?
- What does the efSearch parameter trade off in HNSW?

## Build evidence

- **Recall / latency benchmark dashboard** — Plot recall vs latency for ANN parameter sweeps against the brute-force baseline.

## Prerequisites

- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db.html)

## Related concepts

- [IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf.html)
- [Recall / Latency Tradeoffs](https://learn.significanthobbies.com/curriculum/concepts/recall-latency-tradeoffs.html)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
