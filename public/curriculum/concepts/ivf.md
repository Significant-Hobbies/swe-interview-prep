# IVF (Inverted File)

Cluster vectors with k-means, then search only the nearest cells (nprobe).

- Difficulty: advanced
- Tracks: Vector DB & ANN

## Mental model

IVF partitions the space into Voronoi cells via k-means. A query is matched to its nearest cells (nprobe of them) and only those vectors are scanned — trading recall for a big speedup.

## Where it matters

FAISS IVF indexes, often combined with product quantization (IVF-PQ).

## Common mistakes

- Setting nprobe=1 and wondering why recall is poor
- Too few or too many centroids for the dataset size

## Primary sources

- [Pinecone — IVF index](https://www.pinecone.io/learn/series/faiss/vector-indexes/) (article)

## Practice

### IVF nprobe vs recall

100k vectors, 1000 centroids, nprobe=1 recalls 70%, nprobe=8 recalls 92%. Latency 2ms→9ms. Pick nprobe for prod if SLA is 5ms and recall target 85%.

**Expected evidence:** nprobe=8 exceeds recall but misses SLA; try nprobe=4 and measure curve.

## Review prompts

- What happens to recall and latency as you increase nprobe in IVF?


## Prerequisites

- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db.html)

## Related concepts

- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw.html)
- [Product Quantization](https://learn.significanthobbies.com/curriculum/concepts/product-quantization.html)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
