# PQ codebook footprint

> 1536-d vector, m=48 subspaces, 256 centroids per subspace, 1 byte code/subspace. Bytes per vector vs raw float32?

Canonical: https://learn.significanthobbies.com/curriculum/drills/pq-codebook-size

1536-d vector, m=48 subspaces, 256 centroids per subspace, 1 byte code/subspace. Bytes per vector vs raw float32?

## The mechanism

PQ splits each vector into m sub-vectors and replaces each with the id of its nearest centroid in a per-sub-space codebook. With 8-bit codes that is one byte per sub-vector: a 1536-d float32 vector (6 KB) becomes roughly 48-192 bytes depending on m — a 30-100x cut, paid for with approximate distances.

## Expected evidence

48 bytes vs 6144 bytes (~128× compression).

## Hints

- Each subspace stores an index 0–255.
- Distance is approximate.

## Sources and practice

- [Product Quantization for Nearest Neighbor Search (Jégou et al.)](https://ieeexplore.ieee.org/document/5432202)
- [Study Product Quantization](https://learn.significanthobbies.com/curriculum/concepts/product-quantization)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/pq-codebook-size)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
