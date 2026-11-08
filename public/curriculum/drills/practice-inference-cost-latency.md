# Design exercise: Inference Cost & Latency Optimization

> Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request. Implement designOutline() returning non-empty values for: workload, latencyBreakdown, costModel. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-inference-cost-latency

Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request. Implement designOutline() returning non-empty values for: workload, latencyBreakdown, costModel. Each value must name a concrete mechanism or decision.

## The mechanism

Serving optimization is a constrained frontier: quality, TTFT, token latency, throughput, availability, and cost must be measured on the same representative workload.

## Expected evidence

A design outline with workload, latencyBreakdown, costModel plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Splitwise: Efficient Generative LLM Inference Using Phase Splitting](https://arxiv.org/abs/2311.18677)
- [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192)
- [MLPerf Inference Benchmark](https://arxiv.org/abs/1911.02549)
- [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving (OSDI '24)](https://arxiv.org/abs/2401.09670)
- [Hugging Face — LLM Inference Optimization](https://huggingface.co/docs/transformers/main/en/llm_optims)
- [Study Inference Cost & Latency Optimization](https://learn.significanthobbies.com/curriculum/concepts/inference-cost-latency)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-inference-cost-latency)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
