# Scalar & Binary Quantization

Shrinking vectors to int8 or single bits, and rescoring to recover the lost precision.

- Difficulty: core
- Tracks: Vector DB & ANN

## Mental model

Quantisation trades recall for memory, and memory is what decides whether an index fits in RAM. Scalar quantisation maps each float32 dimension to int8 for a 4x reduction and small recall loss; binary quantisation keeps one bit per dimension for 32x, turning distance into a Hamming popcount that is enormously faster but far coarser. The standard pattern is two-stage: retrieve a generous candidate set with the compressed vectors, then rescore the survivors against full-precision copies, which recovers most of the lost accuracy for a fraction of the memory.

## Where it matters

The reason a billion-vector index fits on one machine, and the first lever when a vector database is memory-bound.

## Common mistakes

- Quantising without a rescore step and accepting the recall drop as inevitable
- Calibrating scalar ranges on unrepresentative data, so outliers clip
- Using binary quantisation on low-dimensional embeddings, where there are too few bits to preserve structure
- Measuring only the memory win and never re-measuring recall@k afterwards

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Scalar quantise and rescore

Implement quantize(vec, min, max) mapping each float to an int in 0..255, dequantize(codes, min, max) mapping back to the bucket centre, and maxAbsError(vec, min, max) returning the largest absolute reconstruction error. Values outside [min,max] clamp.

**Expected evidence:** Error is bounded by half a bucket width: (max-min)/255/2.

## Review prompts

- Binary quantisation cuts memory 32x but loses a lot of precision. Why does the two-stage retrieve-then-rescore pattern get most of the accuracy back?


## Prerequisites

- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity)

## Related concepts

- [Product Quantization](https://learn.significanthobbies.com/curriculum/concepts/product-quantization)
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
