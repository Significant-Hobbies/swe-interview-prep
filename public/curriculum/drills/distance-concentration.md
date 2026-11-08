# Distances concentrate as dimensions grow

> Implement contrast(points, query) returning (maxDist - minDist) / minDist using Euclidean distance — the relative contrast between the farthest and nearest point. Round to 3 decimals. Return 0 when minDist is 0.

Canonical: https://learn.significanthobbies.com/curriculum/drills/distance-concentration

Implement contrast(points, query) returning (maxDist - minDist) / minDist using Euclidean distance — the relative contrast between the farthest and nearest point. Round to 3 decimals. Return 0 when minDist is 0.

## The mechanism

As dimensions grow, the distance from a query to its nearest and farthest points converges: the ratio (max−min)/min tends to zero, so 'nearest' stops being meaningful and an index that prunes by distance has nothing left to prune with. This is why exact high-dimensional search degrades to a scan and why ANN methods change the question — they exploit the fact that real embeddings occupy a low-dimensional manifold rather than filling the space uniformly.

## Expected evidence

Contrast is large in low dimensions and tends toward 0 as dimensionality grows.

## Hints

- Plain Euclidean distance; the interesting part is what the ratio does as the vectors get longer.
- Guard the zero-distance case before dividing.

## Sources and practice


- [Study Curse of Dimensionality](https://learn.significanthobbies.com/curriculum/concepts/curse-of-dimensionality)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/distance-concentration)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
