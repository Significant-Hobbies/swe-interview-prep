# Inference Cost & Latency Optimization

Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

Serving optimization is a constrained frontier: quality, TTFT, token latency, throughput, availability, and cost must be measured on the same representative workload.



## Primary sources

- [Splitwise: Efficient Generative LLM Inference Using Phase Splitting](https://arxiv.org/abs/2311.18677) (doc)
- [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192) (doc)
- [MLPerf Inference Benchmark](https://arxiv.org/abs/1911.02549) (doc)
- [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving (OSDI '24)](https://arxiv.org/abs/2401.09670) (paper)
- [Hugging Face — LLM Inference Optimization](https://huggingface.co/docs/transformers/main/en/llm_optims) (doc)

## Practice

### Design exercise: Inference Cost & Latency Optimization

Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request. Implement designOutline() returning non-empty values for: workload, latencyBreakdown, costModel. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with workload, latencyBreakdown, costModel plus an explicit failure mode or trade-off.

## Review prompts

- Why do TTFT and inter-token latency pull the scheduler in opposite directions?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [GPU Utilization](https://learn.significanthobbies.com/curriculum/concepts/gpu-utilization.html)
- [Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching.html)

## Related concepts

- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware.html)
- [Local & On-device Inference](https://learn.significanthobbies.com/curriculum/concepts/local-on-device-inference.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
