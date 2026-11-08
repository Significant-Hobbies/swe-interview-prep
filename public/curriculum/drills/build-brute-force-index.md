# Build a brute-force vector index

> Build an index that stores vectors and answers top-k queries by scanning every vector. Benchmark latency as the vector count grows.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-brute-force-index

Build an index that stores vectors and answers top-k queries by scanning every vector. Benchmark latency as the vector count grows.

## The mechanism

Brute force computes the metric against every stored vector. It is O(n·d) and slow at scale, but it is exact — making it the recall=1.0 baseline that every ANN index is measured against.

## Expected evidence

Exact top-k results; a latency-vs-n table.

## Hints

- Batch the scan as a matrix multiply.
- This is your recall=1.0 baseline.

## Sources and practice

- [FAISS — Getting started](https://github.com/facebookresearch/faiss/wiki/Getting-started)
- [Study Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-brute-force-index)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
