# Product Quantization

Compress vectors into sub-space codebooks for tiny memory footprint.

- Difficulty: advanced
- Tracks: Vector DB & ANN

## Mental model

PQ splits each vector into m sub-vectors and replaces each with the id of its nearest centroid in a per-sub-space codebook. With 8-bit codes that is one byte per sub-vector: a 1536-d float32 vector (6 KB) becomes roughly 48-192 bytes depending on m — a 30-100x cut, paid for with approximate distances.

## Where it matters

FAISS IVF-PQ, billion-scale vector search under a memory budget.

## Common mistakes

- Using PQ without IVF and losing the speedup
- Too-aggressive compression that destroys recall

## Primary sources

- [Product Quantization for Nearest Neighbor Search (Jégou et al.)](https://ieeexplore.ieee.org/document/5432202) (paper)

## Practice

### PQ codebook footprint

1536-d vector, m=48 subspaces, 256 centroids per subspace, 1 byte code/subspace. Bytes per vector vs raw float32?

**Expected evidence:** 48 bytes vs 6144 bytes (~128× compression).

## Review prompts

- How does product quantization shrink vector memory?


## Prerequisites

- [IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf.html)

## Related concepts

- [Recall / Latency Tradeoffs](https://learn.significanthobbies.com/curriculum/concepts/recall-latency-tradeoffs.html)

## Learning paths

- No roadmap is assigned yet.
