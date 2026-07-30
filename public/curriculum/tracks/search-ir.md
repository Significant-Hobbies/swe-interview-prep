# Search & IR

Lexical retrieval beyond embeddings: tokenization, inverted indexes, BM25, ranking, hybrid search, and search evaluation.

This track contains 13 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html) — Rebuild learning momentum by taking one concept all the way to a shipped artifact.
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html) — Build a solid foundation in both lexical and vector retrieval, ending with hybrid search.
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html) — Build a strong retrieval, vector, AI-systems, and storage foundation through HighSignal and Codevetter.
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html) — Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.

## Concepts

- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization.html) (intro) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html) (core) — Term → posting list mapping that powers fast keyword lookup.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf.html) (core) — Term frequency × inverse document frequency weighting for relevance.
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html) (core) — The standard lexical ranking function: TF saturation + IDF + length normalization.
- [Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics.html) (core) — Precision, recall, MRR, and nDCG for measuring retrieval quality.
- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals.html) (core) — Building a labelled query set and harness to compare retrieval approaches.
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search.html) (advanced) — Fusing lexical (BM25) and vector retrieval, usually via reciprocal rank fusion.
- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking.html) (advanced) — A second-stage cross-encoder pass that reorders the top-k candidates.
- [Query Rewriting](https://learn.significanthobbies.com/curriculum/concepts/query-rewriting.html) (core) — Expanding, correcting, and normalizing queries before retrieval.
- [Search Systems](https://learn.significanthobbies.com/curriculum/concepts/search-discovery.html) (core) — Inverted index, ranking, autocomplete at scale.
- [Top-k Pruning (WAND)](https://learn.significanthobbies.com/curriculum/concepts/top-k-pruning.html) (advanced) — WAND, MaxScore, and block-max — skipping documents that cannot reach the top k.
- [Learning to Rank](https://learn.significanthobbies.com/curriculum/concepts/learning-to-rank.html) (advanced) — Pointwise, pairwise, and listwise objectives — and why the metric you care about is not differentiable.
- [Click Models & Position Bias](https://learn.significanthobbies.com/curriculum/concepts/click-models.html) (advanced) — Why clicks are not relevance labels, and how to debias implicit feedback.
