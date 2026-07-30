# 9-Day Reset

A short sprint to break inertia. End the nine days with one real artifact — a working BM25 search — and the loop muscle memory restored.

- Horizon: 9d
- Outcome: Rebuild learning momentum by taking one concept all the way to a shipped artifact.
- Tracks: Search & IR

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html) — Discrete and continuous distributions, expectation, variance, and the law of large numbers.
- [Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics.html) — Precision, recall, MRR, and nDCG for measuring retrieval quality.
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html) — Point estimates, standard error, confidence intervals, and what '95% confident' actually means.
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html) — Null and alternative hypotheses, p-values, significance, power, and Type I/II errors.



## Milestone 2: Days 1-3 — Retrieval foundations

Understand how lexical search ranks documents.

### Concepts

- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization.html) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html) — Term → posting list mapping that powers fast keyword lookup.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf.html) — Term frequency × inverse document frequency weighting for relevance.
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html) — The standard lexical ranking function: TF saturation + IDF + length normalization.



## Milestone 3: Days 4-6 — Build

Implement a working BM25 ranker on a real index.

### Concepts

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html) — The standard lexical ranking function: TF saturation + IDF + length normalization.
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html) — Term → posting list mapping that powers fast keyword lookup.

### Build evidence

- **Implement BM25 search in HighSignal** — Index a corpus of articles and serve ranked keyword search using BM25.

## Milestone 4: Days 7-9 — Ship and review

Finish the artifact, write it up, and schedule reviews.

### Concepts

- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals.html) — Building a labelled query set and harness to compare retrieval approaches.

### Build evidence

- **Search eval harness** — A reusable harness that scores any retriever against a labelled query set.
