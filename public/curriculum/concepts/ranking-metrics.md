# Ranking Metrics

Precision, recall, MRR, and nDCG for measuring retrieval quality.

- Difficulty: core
- Tracks: Search & IR

## Mental model

Precision/recall measure set quality; MRR rewards getting one right answer near the top; nDCG rewards graded relevance discounted by rank. Pick the metric that matches what users feel.

## Where it matters

Every search/recommendation quality dashboard.

## Common mistakes

- Reporting accuracy instead of rank-aware metrics
- Using nDCG without graded relevance labels
- Measuring recall without a fixed cutoff k

## Primary sources

- [Introduction to Information Retrieval (Manning et al.) — §8.4 Evaluation of ranked retrieval results](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html) (doc)

## Practice

### Compute precision and recall by hand

Given retrieved doc ids [1,4,2,9] and relevant ids {2,4,7}, compute precision@4 and recall@4.

**Expected evidence:** precision@4 = 0.5 (2 relevant in 4), recall@4 = 2/3.

## Review prompts

- When would you use MRR versus nDCG?

## Build evidence

- **Search eval harness** — A reusable harness that scores any retriever against a labelled query set.

## Prerequisites

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html)

## Related concepts

- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals.html)
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html)
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
