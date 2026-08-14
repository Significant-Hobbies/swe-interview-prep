# Vector DB & ANN

Vector search engines: similarity, top-k, brute force, HNSW, IVF, quantization, metadata filtering, and recall/latency tradeoffs.

This track contains 12 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day) — Build a solid foundation in both lexical and vector retrieval, ending with hybrid search.
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day) — Build a strong retrieval, vector, AI-systems, and storage foundation through HighSignal and Codevetter.
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month) — Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.

## Concepts

- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings) (core) — Mapping text/images into dense vectors where distance encodes meaning.
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity) (core) — Cosine, dot product, and L2 distance — how to score vector closeness.
- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search) (core) — Returning the k nearest vectors to a query, exact or approximate.
- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db) (core) — Exact nearest-neighbour search by scanning every vector — the correctness baseline.
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw) (advanced) — Hierarchical Navigable Small World graphs — the dominant ANN index.
- [IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf) (advanced) — Cluster vectors with k-means, then search only the nearest cells (nprobe).
- [Product Quantization](https://learn.significanthobbies.com/curriculum/concepts/product-quantization) (advanced) — Compress vectors into sub-space codebooks for tiny memory footprint.
- [Metadata Filtering](https://learn.significanthobbies.com/curriculum/concepts/metadata-filtering) (core) — Combining vector search with structured predicates (tenant, date, tags).
- [Recall / Latency Tradeoffs](https://learn.significanthobbies.com/curriculum/concepts/recall-latency-tradeoffs) (advanced) — Reading recall-vs-latency curves to choose ANN parameters.
- [Scalar & Binary Quantization](https://learn.significanthobbies.com/curriculum/concepts/vector-quantization) (core) — Shrinking vectors to int8 or single bits, and rescoring to recover the lost precision.
- [Disk-Based ANN](https://learn.significanthobbies.com/curriculum/concepts/disk-based-ann) (advanced) — DiskANN and SPANN — serving vector indexes that do not fit in memory.
- [Index Updates & Tombstones](https://learn.significanthobbies.com/curriculum/concepts/index-updates-tombstones) (advanced) — Deleting and updating vectors in a graph index without rebuilding it.
