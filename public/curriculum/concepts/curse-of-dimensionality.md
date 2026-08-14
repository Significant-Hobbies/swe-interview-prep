# Curse of Dimensionality

Why distances concentrate in high dimensions, and what that does to nearest-neighbour search.

- Difficulty: core
- Tracks: Mathematics

## Mental model

As dimensions grow, the distance from a query to its nearest and farthest points converges: the ratio (max−min)/min tends to zero, so 'nearest' stops being meaningful and an index that prunes by distance has nothing left to prune with. This is why exact high-dimensional search degrades to a scan and why ANN methods change the question — they exploit the fact that real embeddings occupy a low-dimensional manifold rather than filling the space uniformly.

## Where it matters

The reason vector databases use ANN indexes rather than exact search, and the argument for dimensionality reduction before clustering.

## Common mistakes

- Assuming intuition from 2D or 3D survives — volume concentrates near the shell of a high-dimensional ball, not the centre
- Concluding nearest-neighbour search is hopeless; the theory assumes independent uniform data, and real embeddings are far from that
- Adding dimensions to an embedding expecting monotonically better retrieval
- Comparing raw Euclidean distances across dimensionalities as if the scale were the same

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Distances concentrate as dimensions grow

Implement contrast(points, query) returning (maxDist - minDist) / minDist using Euclidean distance — the relative contrast between the farthest and nearest point. Round to 3 decimals. Return 0 when minDist is 0.

**Expected evidence:** Contrast is large in low dimensions and tends toward 0 as dimensionality grows.

## Review prompts

- In high dimensions the ratio (farthest − nearest)/nearest tends to zero. What does that break, and why do vector databases still work?


## Prerequisites

- [Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces)

## Related concepts

- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity)
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
