# 30-Day Retrieval Basics

Four weeks that take you from tokenization to a working hybrid retriever evaluated against a frozen query set.

- Horizon: 30d
- Outcome: Build a solid foundation in both lexical and vector retrieval, ending with hybrid search.
- Tracks: Search & IR, Vector DB & ANN

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [Learning to Rank](https://learn.significanthobbies.com/curriculum/concepts/learning-to-rank) — Pointwise, pairwise, and listwise objectives — and why the metric you care about is not differentiable.
- [Click Models & Position Bias](https://learn.significanthobbies.com/curriculum/concepts/click-models) — Why clicks are not relevance labels, and how to debias implicit feedback.
- [Scalar & Binary Quantization](https://learn.significanthobbies.com/curriculum/concepts/vector-quantization) — Shrinking vectors to int8 or single bits, and rescoring to recover the lost precision.
- [Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces) — Vectors as ordered lists, dot products, norms, orthogonality, and the geometric picture of n-dimensional space.
- [Curse of Dimensionality](https://learn.significanthobbies.com/curriculum/concepts/curse-of-dimensionality) — Why distances concentrate in high dimensions, and what that does to nearest-neighbour search.
- [Top-k Pruning (WAND)](https://learn.significanthobbies.com/curriculum/concepts/top-k-pruning) — WAND, MaxScore, and block-max — skipping documents that cannot reach the top k.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables) — Discrete and continuous distributions, expectation, variance, and the law of large numbers.
- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search) — Returning the k nearest vectors to a query, exact or approximate.
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence) — Point estimates, standard error, confidence intervals, and what '95% confident' actually means.
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing) — Null and alternative hypotheses, p-values, significance, power, and Type I/II errors.



## Milestone 2: Week 1 — Lexical retrieval

Tokenization, inverted index, BM25.

### Concepts

- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index) — Term → posting list mapping that powers fast keyword lookup.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf) — Term frequency × inverse document frequency weighting for relevance.
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25) — The standard lexical ranking function: TF saturation + IDF + length normalization.

### Build evidence

- **Implement BM25 search in HighSignal** — Index a corpus of articles and serve ranked keyword search using BM25.

## Milestone 3: Week 2 — Evaluation

Make retrieval quality measurable.

### Concepts

- [Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics) — Precision, recall, MRR, and nDCG for measuring retrieval quality.
- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals) — Building a labelled query set and harness to compare retrieval approaches.

### Build evidence

- **Search eval harness** — A reusable harness that scores any retriever against a labelled query set.

## Milestone 4: Week 3 — Vector retrieval

Embeddings, similarity, exact nearest-neighbour search.

### Concepts

- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings) — Mapping text/images into dense vectors where distance encodes meaning.
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity) — Cosine, dot product, and L2 distance — how to score vector closeness.
- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db) — Exact nearest-neighbour search by scanning every vector — the correctness baseline.
- [Metadata Filtering](https://learn.significanthobbies.com/curriculum/concepts/metadata-filtering) — Combining vector search with structured predicates (tenant, date, tags).

### Build evidence

- **Brute-force vector index** — An exact nearest-neighbour index — the recall=1.0 baseline.

## Milestone 5: Week 4 — Hybrid search

Fuse lexical and vector retrieval and prove it wins.

### Concepts

- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search) — Fusing lexical (BM25) and vector retrieval, usually via reciprocal rank fusion.
- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking) — A second-stage cross-encoder pass that reorders the top-k candidates.

### Build evidence

- **Hybrid search v0 in HighSignal** — Combine BM25 and vector retrieval with reciprocal rank fusion.
