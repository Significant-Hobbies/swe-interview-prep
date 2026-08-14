# Hybrid Search

Fusing lexical (BM25) and vector retrieval, usually via reciprocal rank fusion.

- Difficulty: advanced
- Tracks: Search & IR

## Mental model

Lexical search nails exact terms and rare tokens; vector search captures meaning. Hybrid search runs both and fuses the rankings (commonly Reciprocal Rank Fusion) so you get precision and recall together.

## Where it matters

Production RAG retrieval, Elasticsearch hybrid, Weaviate/Qdrant hybrid modes.

## Common mistakes

- Naively averaging incomparable BM25 and cosine scores
- Skipping RRF and instead picking one retriever per query
- Not re-evaluating after adding the second retriever

## Primary sources

- [Reciprocal Rank Fusion (Cormack et al.)](https://doi.org/10.1145/1571941.1572114) (paper)
- [Elasticsearch — Hybrid search](https://www.elastic.co/search-labs/blog/hybrid-search-elasticsearch) (article)
- [Pinecone — Hybrid search overview](https://www.pinecone.io/learn/hybrid-search/) (article)

## Practice

### Implement reciprocal rank fusion

Given two ranked result lists (BM25 and vector), fuse them with RRF: score(d) = Σ 1/(k + rank_i(d)), k≈60.

**Expected evidence:** A single fused ranking that uses rank, not raw scores.

## Review prompts

- Why use reciprocal rank fusion instead of averaging BM25 and cosine scores?
- How would you combine BM25 and vector search?

## Build evidence

- **Hybrid search v0 in HighSignal** — Combine BM25 and vector retrieval with reciprocal rank fusion.

## Prerequisites

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25)
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity)

## Related concepts

- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking)
- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals)
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
