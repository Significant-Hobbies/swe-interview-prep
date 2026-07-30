# Search Evals

Building a labelled query set and harness to compare retrieval approaches.

- Difficulty: core
- Tracks: Search & IR

## Mental model

You cannot improve retrieval you cannot measure. A search eval is a fixed set of queries with known-good results plus a harness that scores any retriever — it turns ranking changes from vibes into numbers.

## Where it matters

BEIR benchmark, internal relevance suites at every search company.

## Common mistakes

- Tuning ranking without a frozen eval set
- Letting the eval set leak into tuning decisions
- Too few queries to detect real regressions

## Primary sources

- [BEIR: Heterogeneous IR Benchmark](https://github.com/beir-cellar/beir) (article)

## Practice

### Build a search eval harness

Create a labelled query set (query → relevant doc ids) and a harness that scores any retriever with recall@k, MRR, and nDCG.

**Expected evidence:** A single command that prints the three metrics for a retriever.

## Review prompts

- Why must the eval query set be frozen before tuning?

## Build evidence

- **Search eval harness** — A reusable harness that scores any retriever against a labelled query set.

## Prerequisites

- [Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics.html)
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html)

## Related concepts

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html)
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search.html)
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals.html)
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering.html)

## Learning paths

- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
