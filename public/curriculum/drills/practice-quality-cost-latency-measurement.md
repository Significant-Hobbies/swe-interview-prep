# Design exercise: Quality, Cost & Latency Measurement

> Task success, calibrated quality, token and tool cost, latency distributions, reliability, and Pareto frontiers. Implement designOutline() returning non-empty values for: qualityMetric, costMetric, latencyMetric. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-quality-cost-latency-measurement

Task success, calibrated quality, token and tool cost, latency distributions, reliability, and Pareto frontiers. Implement designOutline() returning non-empty values for: qualityMetric, costMetric, latencyMetric. Each value must name a concrete mechanism or decision.

## The mechanism

No AI metric stands alone. Compare candidate systems on the same workload and plot quality, cost, latency, and failure rate together. Scope: this card owns comparing candidate SYSTEMS on one workload — the Pareto frontier across quality, token and tool cost, latency distribution, and failure rate. Scoring an individual output is `llm-evals`; gating a release on the result is `ai-regression-testing`.

## Expected evidence

A design outline with qualityMetric, costMetric, latencyMetric plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [MLPerf Inference Benchmark](https://arxiv.org/abs/1911.02549)
- [Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference](https://arxiv.org/abs/2403.04132)
- [The Tail at Scale](https://research.google/pubs/the-tail-at-scale/)
- [HELM — Holistic Evaluation of Language Models (Stanford CRFM)](https://crfm.stanford.edu/helm/)
- [Site Reliability Engineering — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [MLPerf Inference](https://mlcommons.org/benchmarks/inference-datacenter/)
- [Study Quality, Cost & Latency Measurement](https://learn.significanthobbies.com/curriculum/concepts/quality-cost-latency-measurement)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-quality-cost-latency-measurement)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
