# Content preview: first system-design publication batch

Status: approved by the owner on 2026-08-04 and generated from the canonical system-design case catalog.

## Candidate 1: System-design case library hub

- Proposed URL: `/system-design/`
- Search intent: browse and compare common system-design interview questions, then choose study or closed-book practice
- Title: `System Design Interview Questions | SWE Prep`
- Meta description: `Practice common system design interview questions with staged prompts, capacity math, failure drills, worked guides, and targeted concept review.`
- H1: `System design interview questions you can actually practice`

### Complete draft

Most system-design question lists stop at the prompt. Knowing that “design a rate limiter” is common does not prove that you can clarify the contract, estimate load, choose a consistency model, defend the hot path, or recover when the interviewer changes one constraint.

This library treats each question as a complete interview. Every case moves through the same six stages: scope the problem, estimate capacity, draw the high-level design, defend one critical path, respond to a failure injection, and review the evidence. You can study a worked guide or start a closed-book attempt. During practice, the reference answer stays hidden until you submit.

## Start with the AI infrastructure cases

### Design LLM inference serving at 10,000 requests per second

The trick is recognizing that request rate is not enough. Model size, prompt and completion distributions, time to first token, output speed, streaming duration, and KV-cache memory determine the fleet. The case tests token math, admission control, continuous batching, routing, overload behavior, GPU capacity measurement, and multi-zone reliability.

Study the worked guide, or enter a 45-minute practice session and discover the assumptions yourself.

### Design production RAG over a large document corpus

Separate the offline ingestion contract from the online retrieval-and-generation path. The case tests freshness, document permissions, chunk identity, hybrid retrieval, reranking, context assembly, citation grounding, evaluation, and failure isolation when an index or embedding version changes.

### Design a multi-tenant LLM API gateway

Build the control point in front of several models and providers. The case tests authentication, per-tenant quotas, token-aware rate limits, model routing, retries, idempotency, streaming proxy behavior, budget enforcement, observability, and safe fallback when a provider slows down.

## Practice the distributed-systems classics

### Design a URL shortener

Turn daily write volume and a read-heavy redirect path into an ID-space, storage, cache, and abuse design. The follow-ups cover hot links, custom aliases, expiration, analytics, regional replication, and the trade-off between a globally coordinated counter and independently generated IDs.

### Design a distributed rate limiter

Define the enforcement contract before choosing token bucket, fixed window, or sliding-window state. The case tests atomic updates, clock behavior, regional consistency, local fail-open or fail-closed policy, burst handling, HTTP response semantics, and what happens when the shared store is slow.

### Design real-time chat

Follow a message from a connected sender to durable storage, fan-out, offline delivery, and acknowledgements. The interview probes connection ownership, per-conversation ordering, idempotency, group hot spots, presence, push notifications, reconnect gaps, and multi-device state.

### Design a ranked news feed

Separate candidate generation, ranking, filtering, and feed delivery. The case tests fan-out on write versus read, celebrity traffic, cache invalidation, freshness, cold start, feature availability, moderation, and graceful fallback when the ranker is unavailable.

### Design a real-time recommendation system

Combine offline feature and model pipelines with an online retrieve-rank-serve path. The interview tests latency budgets, feature freshness, candidate diversity, feedback loops, exploration, model rollout, counterfactual evaluation, and a degraded experience when online features lag.

## How to use a case

If the interview is soon, start closed-book and use the review to find the exact weak dimension. If the topic is new, read the relevant concept pages first, study the worked case, wait a day, and then attempt it without notes. A strong answer is not one memorized diagram. It is a chain of explicit assumptions, defensible calculations, named trade-offs, and operational responses.

Your result is broken down by requirements, capacity reasoning, architecture, deep technical judgment, reliability, and communication. Missed dimensions link back to focused concepts and drills; a weakness in estimation does not erase evidence that you handled failure recovery well.

The initial public guide covers LLM inference at 10K RPS. The remaining cases are available for practice first and will receive public guides only after their calculations, sources, and editorial copy clear the same review bar.

## Candidate 2: Design LLM inference at 10K RPS

- Proposed URL: `/system-design/llm-inference-10k-rps.html`
- Search intent: learn and rehearse an interview answer for high-throughput LLM serving
- Title: `Design LLM Inference at 10K RPS | Interview Guide`
- Meta description: `Work through requirements, token math, batching, GPU fleet sizing, reliability, and follow-ups for a 10,000 RPS LLM inference interview.`
- H1: `Design LLM inference serving at 10,000 requests per second`
- Structured data: `Article` and `BreadcrumbList`

### Complete draft

“Design LLM inference for 10,000 requests per second” sounds like a throughput-sizing question. The strongest opening is to say that 10K RPS alone is not enough to size an autoregressive serving system. One request might classify ten tokens; another might stream a 2,000-token answer while retaining a large KV cache. The interview is really testing whether you turn an ambiguous headline into a measurable workload and a system that stays inside a latency and cost envelope.

Here is a defensible way to structure the answer.

## 1. Clarify the contract before drawing boxes

Start with the questions that change the architecture:

- Which model or model family are we serving, and can quality requirements tolerate quantization or a smaller fallback model?
- What are the p50, p95, and p99 input-token and output-token distributions? What is the maximum context?
- Is 10K RPS an average, a sustained peak, or a short burst? What daily and regional traffic pattern should we expect?
- Is output streamed? What are the targets for time to first token, inter-token latency, and total completion time?
- Do tenants have priorities, quotas, data-residency constraints, or different models and adapters?
- What availability target is required? Can overload reject work, shorten output, or route to a degraded model?
- Are prompts sufficiently repetitive for prefix caching, and are responses deterministic enough for safe result caching?

For a concrete interview, state assumptions after asking. Suppose the service uses one fixed model, streams output, receives a sustained 10K RPS with a 15K RPS short peak, averages 1,000 input tokens and 200 output tokens, targets p99 time to first token below one second, and generates around 50 tokens per second per active stream. The exact numbers are not universal; making them explicit is the point.

## 2. Convert RPS into the workload the GPUs see

Under those assumptions, steady input traffic is:

`10,000 requests/s × 1,000 input tokens/request = 10,000,000 input tokens/s`

Steady output traffic is:

`10,000 requests/s × 200 output tokens/request = 2,000,000 output tokens/s`

At 50 generated tokens per second, an average 200-token completion remains active for about four seconds. Little's Law gives the average number of concurrent generations:

`concurrency = arrival rate × time in system = 10,000 × 4 = 40,000 active sequences`

That concurrency matters because each active sequence consumes scheduler state and KV-cache memory. It also tells us why a system designed around one-request-at-a-time GPU execution will fail even if its nominal compute looks large enough.

Repeat the calculation for the peak and for the p95 token lengths, not only the average. Capacity must satisfy at least four constraints: prefill token throughput, decode token throughput, active-sequence or KV-cache capacity, and the latency SLO. Whichever constraint saturates first sets fleet capacity.

## 3. Do not guess a GPU count

There is no honest universal answer such as “use 500 H100s.” Throughput changes with model architecture and size, precision, tensor or pipeline parallelism, context distribution, batch policy, serving engine, hardware, and latency target. The correct capacity-planning loop is:

1. replay a representative prompt and output-length distribution against one candidate replica;
2. sweep concurrency and batching parameters;
3. find the highest sustainable throughput that still meets the tail-latency and error SLO;
4. size each traffic pool from that measured capacity;
5. add failure and burst headroom.

If one measured replica sustains `C` requests per second for this exact workload at the target p99, a first request-based estimate is:

`replicas = ceil(peak RPS / (C × target utilization))`

With a target utilization of 70%, headroom is built into the denominator. But keep the token and KV-cache checks beside it:

`prefill replicas = ceil(peak input tokens/s / measured prefill tokens/s per replica / 0.7)`

`decode replicas = ceil(peak output tokens/s / measured decode tokens/s per replica / 0.7)`

For a combined prefill/decode worker, use the benchmarked capacity of the mixed workload rather than adding two independent GPU counts. If profiling shows long prompts blocking decode and damaging inter-token latency, separate prefill and decode pools or use chunked prefill—but only after the measurement demonstrates that complexity is justified.

The vLLM PagedAttention paper is useful background for why KV-cache memory management affects throughput, but its published gains are not a capacity number for your model and workload. Likewise, serving-engine documentation shows how batching works; production sizing still comes from your own benchmark.

## 4. Draw the request and control planes

The request path can be described left to right:

`Client → global load balancer → API gateway → admission and quota service → model router → priority queue and batch scheduler → inference worker → streaming gateway → client`

The global layer routes to a healthy region and keeps sessions in one region unless failover is required. The API gateway authenticates the tenant, validates request size, applies token-aware quotas, assigns a deadline and request ID, and supports cancellation when the client disconnects.

The model router chooses a compatible pool by model, adapter, context bucket, tenant tier, and region. It should avoid sending a very long prompt into a queue optimized for short interactive traffic. Separate priority classes prevent batch jobs from consuming the latency budget of interactive requests.

Each serving replica holds model weights and a managed KV cache. A scheduler continuously forms batches from ready prefill and decode work. Continuous or in-flight batching is important because generation lengths differ: finished sequences leave the batch and new work can enter instead of making the whole batch wait for the longest response. Prefix caching can remove repeated prompt computation when system prompts or shared document prefixes recur, but cache identity must include the exact model, tokenizer, adapter, and prompt prefix.

The streaming gateway forwards tokens with backpressure, observes cancellation, and records completion status. It must not buffer an entire response before sending it; that would defeat the time-to-first-token SLO and waste compute after disconnected clients.

A separate control plane owns the model registry, signed artifacts, rollout configuration, placement, autoscaling targets, and health. Model loading is slow and memory-heavy, so the data plane needs warm capacity. Autoscaling should use queue delay, waiting requests, token throughput, KV-cache pressure, and SLO burn—not CPU utilization alone.

## 5. Make overload a designed state

At this scale, unbounded queues convert a traffic spike into a latency outage. Every request gets a deadline. Queues have maximum depth and age. Admission control estimates whether the selected pool can start and finish work before the deadline.

When capacity is exhausted, degrade intentionally:

- reject lower-priority requests early with a retryable response and backoff guidance;
- enforce per-tenant token budgets so one customer cannot monopolize KV cache;
- cap output length or disable expensive sampling modes for a declared degraded tier;
- route eligible traffic to a smaller or quantized fallback model;
- preserve reserved capacity for critical tenants and health traffic;
- cancel work immediately when its client disconnects or deadline expires.

Retries need budgets and jitter. Blind retries multiply overload. Requests should carry idempotency and trace IDs, but generation replay semantics must be explicit: a stochastic retry may not reproduce the same tokens.

## 6. Survive worker and regional failures

Run serving pools across at least three failure domains within a region, with the load balancer and router aware of healthy capacity. Losing one zone should not push the remaining zones beyond their protected utilization target; that requirement belongs in the headroom calculation.

Worker failure is normal. Stop routing new requests, terminate or retry affected streams according to the API contract, replace the worker, and keep model artifacts in a nearby durable registry or node cache to reduce recovery time. Health checks must distinguish “process is alive” from “model is loaded and can meet a small inference probe.”

For regional loss, route new requests to another warm region. Active streams may need to restart because moving an in-memory KV cache across regions is usually more expensive and fragile than replaying the prompt. State the trade-off: active-active multi-region capacity is costly, but it offers predictable failover; active-passive is cheaper but risks a long cold-load interval.

Consider the interviewer follow-up: traffic jumps from 10K to 20K RPS in thirty seconds. GPU autoscaling alone will be too slow if new nodes and weights take minutes to become ready. The response is a warm buffer, predictive scaling for known events, a rapidly adjustable admission limit, priority shedding, and possibly the smaller fallback model. Queue growth should trigger overload policy before p99 latency collapses.

## 7. Measure user experience, saturation, and cost

The primary SLOs are not generic server latency. Track time to first token, inter-token latency or time per output token, end-to-end completion time, success and cancellation rates, and rejection rate by tenant and model.

For saturation, track waiting and running requests, queue age, prompt and generation tokens per second, batch composition, KV-cache usage and eviction, prefix-cache hit rate, GPU memory, GPU utilization, model-load time, and preemption or recomputation. vLLM exposes running and waiting requests, cache usage, and prompt and generation token rates; NVIDIA's serving documentation similarly exposes queue and batch behavior. These signals are better autoscaling inputs than CPU.

Cost should be reported per successful request and per million input and output tokens, split by model and tenant. Include idle warm capacity, failed or cancelled generation, cross-region traffic, and fallback usage. Optimization is a constrained problem: reduce cost while holding quality and latency constant. Quantization, speculative decoding, prefix caching, and parallelism are experiments to benchmark, not magic checkboxes.

## 8. Close with the trade-offs

A concise final answer sounds like this:

> I would first turn 10K RPS into prompt tokens per second, generated tokens per second, concurrent sequences, and an explicit tail-latency target. Requests enter through authenticated, token-aware admission control, then route by model, context size, priority, and region into bounded deadline-aware queues. Serving workers use continuous batching and managed KV-cache memory; the control plane maintains warm multi-zone capacity and scales on queue and token metrics. I would size the fleet from workload-replay benchmarks at the target p99, keep failure headroom, and shed or degrade low-priority work before queues collapse. The key operational metrics are TTFT, inter-token latency, queue age, token throughput, KV pressure, rejection rate, and cost per token.

That answer is strong because every box follows from a requirement or calculation. It does not pretend that RPS determines hardware by itself.

## Common mistakes

- Treating requests per second as the only load unit.
- Naming a GPU count without specifying the model, token distribution, benchmark, and SLO.
- Using an unbounded FIFO queue and calling it backpressure.
- Autoscaling only on CPU or average GPU utilization.
- Ignoring cancellation, deadlines, retry amplification, and disconnected streaming clients.
- Mixing long batch prompts with interactive traffic without isolation.
- Claiming that prefix caching or quantization is always safe without workload and quality evidence.
- Designing multi-region routing without reserving enough warm capacity to absorb a failure.

## Harder follow-ups to practice

1. How does the design change for several models and thousands of tenant-specific LoRA adapters?
2. When would you disaggregate prefill and decode, and what new network bottleneck does that introduce?
3. How would you preserve fairness when one tenant sends very long contexts?
4. What would you do if p99 time to first token is good but inter-token latency degrades?
5. How would you roll out a new quantized model and prove that the cost gain does not hide a quality regression?

## Primary sources

- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180)
- [NVIDIA Triton Inference Server: dynamic batching](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html)
- [vLLM production metrics](https://docs.vllm.ai/en/stable/design/metrics/)
- [Kubernetes horizontal pod autoscaling with custom metrics](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/)
- [NVIDIA guide to LLM inference benchmarking metrics](https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts/)

## Practice next

Start the closed-book case and spend the first five minutes only on clarifying questions. After review, revisit the linked concepts for inference engines, dynamic batching, KV cache, capacity planning, rate limiting, load shedding, and observability. The goal is not to reproduce this diagram; it is to rebuild the reasoning from the prompt.
