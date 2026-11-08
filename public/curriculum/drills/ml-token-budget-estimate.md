# Estimate training token budget

> Corpus: 1M docs × 800 tokens each. 3 epochs. Total tokens seen? If Chinchilla says ~20 tokens/param for 1B model, rough token budget?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-token-budget-estimate

Corpus: 1M docs × 800 tokens each. 3 epochs. Total tokens seen? If Chinchilla says ~20 tokens/param for 1B model, rough token budget?

## The mechanism

In ML, the dataset is the product. The biggest quality wins usually come from cleaning, deduping, and filtering the data — not from changing the model. Pipelines need versioning and provenance the same way code does.

## Expected evidence

2.4B tokens for corpus; 20B tokens suggested for 1B params.

## Hints

- tokens = docs × tokens/doc × epochs.
- Scale data with model size for compute-optimal training.

## Sources and practice

- [Stanford CS336 — Language Modeling from Scratch (course)](https://cs336.stanford.edu/spring2025/)
- [CS336 Assignment 4 — Common Crawl → pretraining data](https://github.com/stanford-cs336/assignment4-data/tree/main)
- [Rules of Machine Learning: Best Practices for ML Engineering (Google)](https://developers.google.com/machine-learning/guides/rules-of-ml)
- [Made With ML — Data engineering](https://madewithml.com/courses/mlops/data-stack/)
- [Hidden Technical Debt in Machine Learning Systems (NeurIPS 2015)](https://proceedings.neurips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html)
- [Study Training Data Engineering](https://learn.significanthobbies.com/curriculum/concepts/ml-data-engineering)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-token-budget-estimate)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
