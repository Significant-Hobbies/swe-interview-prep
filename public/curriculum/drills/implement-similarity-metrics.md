# Implement similarity metrics

> Implement cosine similarity, dot product, and L2 distance. Show that on normalized vectors, cosine and dot product produce the same ranking.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-similarity-metrics

Implement cosine similarity, dot product, and L2 distance. Show that on normalized vectors, cosine and dot product produce the same ranking.

## The mechanism

Cosine measures angle (direction), dot product measures angle and magnitude, L2 measures straight-line distance. On normalized vectors cosine and dot product rank identically, and L2 becomes a monotonic function of them.

## Expected evidence

Three functions; a demonstration that normalized cosine == dot ranking.

## Hints

- Cosine = dot / (‖a‖·‖b‖).
- On unit vectors L2² = 2 − 2·cosine.

## Sources and practice

- [Pinecone — Vector similarity explained](https://www.pinecone.io/learn/vector-similarity/)
- [Study Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-similarity-metrics)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
