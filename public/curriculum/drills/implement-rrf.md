# Implement reciprocal rank fusion

> Given two ranked result lists (BM25 and vector), fuse them with RRF: score(d) = Σ 1/(k + rank_i(d)), k≈60.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-rrf

Given two ranked result lists (BM25 and vector), fuse them with RRF: score(d) = Σ 1/(k + rank_i(d)), k≈60.

## The mechanism

Lexical search nails exact terms and rare tokens; vector search captures meaning. Hybrid search runs both and fuses the rankings (commonly Reciprocal Rank Fusion) so you get precision and recall together.

## Expected evidence

A single fused ranking that uses rank, not raw scores.

## Hints

- RRF uses ranks, sidestepping incomparable score scales.
- A document missing from a list simply contributes nothing from it.

## Sources and practice

- [Reciprocal Rank Fusion (Cormack et al.)](https://doi.org/10.1145/1571941.1572114)
- [Elasticsearch — Hybrid search](https://www.elastic.co/search-labs/blog/hybrid-search-elasticsearch)
- [Pinecone — Hybrid search overview](https://www.pinecone.io/learn/hybrid-search/)
- [Study Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-rrf)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
