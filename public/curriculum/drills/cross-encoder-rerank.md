# Cross-encoder rerank top-k

> Retrieve top-5 by BM25, then rerank with scores [0.9,0.2,0.8,0.1,0.7] for query "payment API". Return new order.

Canonical: https://learn.significanthobbies.com/curriculum/drills/cross-encoder-rerank

Retrieve top-5 by BM25, then rerank with scores [0.9,0.2,0.8,0.1,0.7] for query "payment API". Return new order.

## The mechanism

Retrieval is recall-oriented and cheap; reranking is precision-oriented and expensive. Retrieve ~100 candidates fast, then run a heavier cross-encoder on just those to reorder the top 10.

## Expected evidence

Doc0, Doc2, Doc4, Doc1, Doc3.

## Hints

- Reranker sees query+doc jointly.
- Only score the small candidate set.

## Sources and practice

- [Sentence-Transformers — Cross-Encoders](https://www.sbert.net/examples/applications/cross-encoder/README.html)
- [Study Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/cross-encoder-rerank)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
