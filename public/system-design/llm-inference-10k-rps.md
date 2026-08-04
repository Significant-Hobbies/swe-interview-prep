# Design LLM inference at 10K RPS

Work through requirements, token math, batching, GPU fleet sizing, reliability, and follow-ups for a 10,000 RPS LLM inference interview.

- [Start the closed-book case](https://learn.significanthobbies.com/mock?prompt=llm-inference-10k-rps&from=guide)
- [Browse all system-design cases](https://learn.significanthobbies.com/system-design/)

## 1. Clarify the contract

“Design LLM inference for 10,000 requests per second” sounds like a throughput question, but 10K RPS alone cannot size an autoregressive serving system. One request might classify ten tokens; another might retain a large KV cache while streaming a 2,000-token answer. The strongest opening is to turn the headline into a measurable workload and a latency, quality, availability, and cost contract.

Ask which model or model family is served and whether quality permits quantization or a smaller fallback. Ask for p50, p95, and p99 input and output token lengths, the maximum context, streaming behavior, time-to-first-token and output-speed targets, traffic peaks, regions, availability, tenant priorities, and cost constraints. Prompt repetition determines whether prefix caching matters; sampling and authorization determine whether complete-response caching is safe.

For a concrete calculation, state assumptions after asking. Suppose one fixed model streams responses, sustained traffic is 10K RPS with a 15K short peak, an average request has 1,000 input and 200 output tokens, p99 TTFT must remain below one second, output runs near 50 tokens per second, and the service must survive one zone. These are illustrative inputs, not universal facts. Making them explicit allows every later box and number to be challenged.

## 2. Capacity math

Convert request traffic into the work the GPUs see. Steady prefill traffic is 10,000 requests/s × 1,000 input tokens/request = 10,000,000 input tokens/s. Decode traffic is 10,000 × 200 = 2,000,000 output tokens/s. At 50 generated tokens/s, a 200-token completion remains active for roughly four seconds. Little’s Law gives about 10,000 × 4 = 40,000 concurrent generations.

Repeat the math for the peak and tail token lengths. Capacity must satisfy prefill throughput, decode throughput, active-sequence and KV-cache capacity, and the latency SLO. The constraint that saturates first determines usable fleet capacity.

Do not guess a GPU count. Replay the representative prompt and output distribution against one candidate replica, sweep concurrency and batching, and find the highest sustainable throughput that still meets p99. If a measured replica sustains C requests/s, an initial estimate is ceil(peak RPS / (C × target utilization)). Cross-check with ceil(peak input tokens/s / measured prefill tokens/s per replica / utilization) and the equivalent decode equation. A 70% target utilization leaves explicit burst and failure headroom.

For combined workers, benchmark the mixed workload instead of adding independent prefill and decode counts. If long prompts demonstrably block decode and damage output cadence, consider chunked prefill or separate pools. PagedAttention explains why KV-cache management changes throughput, but a published benchmark never replaces measurement of this model, hardware, distribution, and SLO.

## 3. Architecture

The request path is client → global load balancer → API gateway → admission and quota service → model router → bounded priority queue and batch scheduler → inference worker → streaming gateway → client.

The global layer routes to a healthy region. The gateway authenticates the tenant, validates request size, assigns a deadline and request ID, enforces token-aware quotas, and propagates cancellation when the client disconnects. The model router selects a compatible pool by model, adapter, context bucket, tenant tier, and region. Long batch prompts should not share an undifferentiated queue with latency-sensitive chat.

Each serving replica holds model weights and managed KV-cache memory. The scheduler continuously forms batches from ready prefill and decode work. Finished sequences leave and new work enters instead of making a static batch wait for the longest generation. A streaming gateway forwards tokens with backpressure and must not buffer the whole answer before delivery.

A separate control plane owns the model registry, signed artifacts, rollout configuration, placement, autoscaling targets, and health. Model loading is slow and memory-heavy, so the data plane maintains warm capacity. Health distinguishes an alive process from a loaded model capable of a small inference probe.

## 4. Deep dive

Batching is a latency-throughput negotiation. Waiting briefly can create a more efficient batch, but waiting consumes the TTFT budget. The scheduler therefore needs per-class queue deadlines, maximum delay, and fairness. It should observe token work rather than treating every request equally: a tenant sending huge contexts can consume far more prefill and KV capacity than one sending short prompts.

Continuous batching handles unequal completion lengths. KV-cache blocks must be allocated and reclaimed predictably, with cancellation freeing memory promptly. Prefix caching can avoid repeated prefill for shared system prompts, but the key includes the exact model, tokenizer, adapter, and prefix. Isolation rules must prevent one tenant’s private prompt state from becoming another tenant’s cache hit.

Prefill and decode contend differently for compute and memory bandwidth. Start with a simpler combined pool. Disaggregate only when profiling shows better SLO or fleet efficiency after accounting for KV transfer, network bandwidth, routing, and extra failure modes. Likewise, quantization, speculative decoding, parallelism, and cache policies are benchmark hypotheses—not unconditional wins.

## 5. Failure handling

Unbounded queues turn a spike into a latency outage. Give every request a deadline and every queue a maximum depth and age. Admission estimates whether the selected pool can finish work before the deadline. When capacity is exhausted, reject lower-priority work early, enforce tenant token budgets, cap output for an explicit degraded tier, route eligible traffic to a smaller model, preserve reserved critical capacity, and cancel work after disconnect or deadline expiry.

Retries need budgets and jitter because blind retries amplify overload. Generation replay semantics must be explicit: a stochastic retry may not reproduce the same tokens.

Run pools across at least three failure domains and reserve enough capacity that losing one does not overload the others. On worker failure, stop routing, terminate or retry streams according to contract, and replace from a nearby artifact or node cache. On regional loss, route new requests to another warm region. Active streams may restart because transferring a live KV cache across regions is usually more complex than replaying the prompt.

If traffic doubles in thirty seconds during a zone loss, cold GPU autoscaling will be too slow. Respond with warm headroom, predictive scaling for known events, an adjustable admission limit, priority shedding, retry control, and the smaller fallback. Trigger overload policy on queue age and SLO burn before p99 collapses.

## 6. Observability and cost

Measure the user experience with TTFT, inter-token latency or time per output token, end-to-end completion time, success, cancellation, and rejection rates by tenant and model. Measure saturation with running and waiting requests, queue age, prompt and generation tokens/s, batch composition, KV-cache usage and eviction, prefix-cache hit rate, GPU memory, model-load time, and preemption or recomputation.

These signals are better scaling inputs than CPU. vLLM exposes running and waiting work, cache usage, and token rates; Triton exposes queue and batch behavior. Scaling policy should combine demand, saturation, readiness delay, and a stabilization window so slow model startup does not cause oscillation.

Report cost per successful request and per million input and output tokens, split by model and tenant. Include warm idle capacity, failed or cancelled work, cross-region traffic, and fallback usage. Optimize cost while holding quality and latency constant. A cheaper quantized result is not a win if it silently violates the product’s quality contract.

## 7. Common mistakes

Common weak answers treat RPS as the only load unit, name a GPU count without a workload benchmark, or draw an unbounded FIFO queue. They scale on CPU, ignore cancellation and retry amplification, mix long batch prompts with interactive traffic, assume prefix caching always helps, or promise regional failover without enough warm capacity to absorb it.

Another mistake is optimizing one average. Production decisions live in distributions: p99 prompt length, p99 TTFT, burst duration, queue age, and tenant skew. State which tail matters and how the system behaves when it cannot meet it.

## 8. Harder follow-ups

How does the design change for several models and thousands of tenant-specific LoRA adapters? When does prefill/decode disaggregation win, and which network bottleneck appears? How do you preserve fairness when one tenant sends very long contexts? What do you inspect when TTFT is healthy but inter-token latency degrades? How do you roll out a quantized model and prove that savings do not hide a quality regression?

Practice answering each by returning to requirements, measurements, and failure behavior. The goal is not to memorize one diagram; it is to rebuild a defensible design when the interviewer changes a constraint.

## Answer outline

Turn 10K RPS into prompt tokens, generated tokens, concurrent sequences, and a tail-latency target. Route authenticated work through token-aware admission into bounded priority queues, then use continuous batching and managed KV-cache memory on warm multi-zone workers. Size pools from workload-replay benchmarks at the target p99 with failure headroom, and shed or degrade low-priority work before queues collapse. Operate on TTFT, inter-token latency, queue age, token throughput, KV pressure, rejection rate, and cost per token.

## Primary sources

- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180) (paper)
- [NVIDIA Triton Inference Server dynamic batching](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html) (official-doc)
- [vLLM production metrics](https://docs.vllm.ai/en/stable/design/metrics/) (official-doc)
- [Kubernetes horizontal pod autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/) (official-doc)
- [NVIDIA LLM inference benchmarking fundamentals](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts/) (official-doc)

## Repair the mechanisms

- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines.html)
- [Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching.html)
- [KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention.html)
- [Inference Cost & Latency Optimization](https://learn.significanthobbies.com/curriculum/concepts/inference-cost-latency.html)
- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware.html)
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)
- [Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory.html)
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html)
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html)
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics.html)
