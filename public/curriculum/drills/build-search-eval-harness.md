# Build a search eval harness

> Create a labelled query set (query → relevant doc ids) and a harness that scores any retriever with recall@k, MRR, and nDCG.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-search-eval-harness

Create a labelled query set (query → relevant doc ids) and a harness that scores any retriever with recall@k, MRR, and nDCG.

## The mechanism

You cannot improve retrieval you cannot measure. A search eval is a fixed set of queries with known-good results plus a harness that scores any retriever — it turns ranking changes from vibes into numbers.

## Expected evidence

A single command that prints the three metrics for a retriever.

## Hints

- Freeze the query set before tuning.
- Score retrievers through one common interface.

## Sources and practice

- [BEIR: Heterogeneous IR Benchmark](https://github.com/beir-cellar/beir)
- [Study Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-search-eval-harness)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
