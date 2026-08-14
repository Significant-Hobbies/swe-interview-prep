# Brute-Force Vector DB

Exact nearest-neighbour search by scanning every vector — the correctness baseline.

- Difficulty: core
- Tracks: Vector DB & ANN

## Mental model

Brute force computes the metric against every stored vector. It is O(n·d) and slow at scale, but it is exact — making it the recall=1.0 baseline that every ANN index is measured against.

## Where it matters

FAISS IndexFlat, the ground-truth oracle for ANN benchmarks.

## Common mistakes

- Skipping the brute-force baseline, so ANN recall is unmeasurable
- Not batching the matrix multiply for the scan
- Assuming brute force is always too slow — it is fine for <100k vectors

## Primary sources

- [FAISS — Getting started](https://github.com/facebookresearch/faiss/wiki/Getting-started) (doc)

## Practice

### Build a brute-force vector index

Build an index that stores vectors and answers top-k queries by scanning every vector. Benchmark latency as the vector count grows.

**Expected evidence:** Exact top-k results; a latency-vs-n table.

## Review prompts

- Why is a brute-force index essential even though it is slow?

## Build evidence

- **Brute-force vector index** — An exact nearest-neighbour index — the recall=1.0 baseline.
- **Metadata filtering for vector search** — Add structured predicate filtering to vector search.

## Prerequisites

- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity)
- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search)

## Related concepts

- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw)
- [Metadata Filtering](https://learn.significanthobbies.com/curriculum/concepts/metadata-filtering)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
