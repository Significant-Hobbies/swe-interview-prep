# Explain HNSW search on paper

> Draw a 3-layer HNSW graph and trace a query: which layer it enters, how it greedily hops, when it descends, and where efSearch widens the search.

Canonical: https://learn.significanthobbies.com/curriculum/drills/explain-hnsw-layers

Draw a 3-layer HNSW graph and trace a query: which layer it enters, how it greedily hops, when it descends, and where efSearch widens the search.

## The mechanism

HNSW builds a layered proximity graph: sparse upper layers for long hops, dense lower layers for fine search. A query greedily walks toward the nearest neighbour, descending layers, so it touches a small neighbourhood instead of the whole set. Malkov & Yashunin report polylogarithmic search cost empirically — it is a measured scaling, not a proven bound.

## Expected evidence

A diagram + walkthrough showing O(log n) traversal instead of O(n) scan.

## Hints

- Upper layers = long hops; lower layers = fine search.
- efSearch trades recall for latency.

## Sources and practice

- [Efficient and robust ANN using HNSW graphs (Malkov & Yashunin)](https://arxiv.org/abs/1603.09320)
- [Study HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/explain-hnsw-layers)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
