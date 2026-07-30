# Reranking

A second-stage cross-encoder pass that reorders the top-k candidates.

- Difficulty: advanced
- Tracks: Search & IR

## Mental model

Retrieval is recall-oriented and cheap; reranking is precision-oriented and expensive. Retrieve ~100 candidates fast, then run a heavier cross-encoder on just those to reorder the top 10.

## Where it matters

Cohere Rerank, cross-encoder rerankers in RAG pipelines.

## Common mistakes

- Reranking the whole corpus instead of a candidate set
- Adding a reranker without measuring latency budget
- Not checking that reranking actually beats the retriever on evals

## Primary sources

- [Sentence-Transformers — Cross-Encoders](https://www.sbert.net/examples/applications/cross-encoder/README.html) (doc)

## Practice

### Cross-encoder rerank top-k

Retrieve top-5 by BM25, then rerank with scores [0.9,0.2,0.8,0.1,0.7] for query "payment API". Return new order.

**Expected evidence:** Doc0, Doc2, Doc4, Doc1, Doc3.

## Review prompts

- Why is reranking done as a second stage instead of over the whole corpus?


## Prerequisites

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html)

## Related concepts

- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search.html)
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html)
- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals.html)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
