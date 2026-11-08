# Perplexity vs classification accuracy

> LM benchmark: PPX dropped 5% but exact-match QA accuracy flat. What does that imply about the eval?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-eval-perplexity-vs-acc

LM benchmark: PPX dropped 5% but exact-match QA accuracy flat. What does that imply about the eval?

## The mechanism

Offline eval (on a held-out test set) tells you the model got better. Online eval (A/B test on real users) tells you the product got better. You need both — neither alone is enough. Scope: this card owns the offline/online split and the classical failure modes — held-out sets, baselines, leakage, distribution shift. Building a grader for free-text output is `llm-evals`; comparing whole systems on cost and latency is `quality-cost-latency-measurement`.

## Expected evidence

LM loss improved token distribution but task metric insensitive or needs few-shot/prompt — check task-specific eval.

## Hints

- PPX measures generative calibration.
- Downstream tasks need their own harness.

## Sources and practice

- [Stanford CS336 — L12 Evaluation (Spring 2025)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_12.json)
- [Eugene Yan — Evaluation & Hallucination](https://eugeneyan.com/writing/evals/)
- [Your AI product needs evals (Hamel Husain)](https://hamel.dev/blog/posts/evals/)
- [Study Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-eval-perplexity-vs-acc)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
