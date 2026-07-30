# 12-Week Inference & Serving

Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics.
- Tracks: Inference & Serving

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs.html) — Forcing LLM output into a validated JSON schema.
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math.html) — Vectors, matrices, dot products, matmul, shapes.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html) — Loss surfaces, learning rate, SGD steps.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop.html) — Chain rule, autograd, forward/backward passes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent.html) — Logits to probabilities, negative log-likelihood loss.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw.html) — Moments, weight decay, gradient clipping.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization.html) — Byte-level, char-level, BPE, vocab design.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling.html) — Next-token prediction, context windows, perplexity.
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings.html) — Token & position embeddings, tied weights.
- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention.html) — Q/K/V, scaled dot-product, causal masking.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head.html) — Parallel heads, head_dim split, output projection.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block.html) — Pre-LayerNorm, residuals, MLP, GELU.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training.html) — Init, NaNs, overfit tests, gradient checks.
- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing.html) — Weights + optimizer state, resume, dataset manifests.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling.html) — Temperature, top-k, greedy decoding.
- [Training Data Engineering](https://learn.significanthobbies.com/curriculum/concepts/ml-data-engineering.html) — Cleaning, dedup, JSONL tasks, memorization tests.
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora.html) — Frozen base, low-rank adapters, rank/alpha.
- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html) — Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.
- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines.html) — Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture.
- [KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention.html) — Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure.
- [Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching.html) — Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness.
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html) — Sending each request to the cheapest model that can handle it.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [FlashAttention & Attention Kernels](https://learn.significanthobbies.com/curriculum/concepts/flashattention-kernels.html) — IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention.
- [Speculative Decoding](https://learn.significanthobbies.com/curriculum/concepts/speculative-decoding.html) — Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation.
- [GPU Utilization](https://learn.significanthobbies.com/curriculum/concepts/gpu-utilization.html) — Compute occupancy, memory bandwidth, kernel launch overhead, tensor parallelism, profiling, and saturation.
- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware.html) — GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [Inference Cost & Latency Optimization](https://learn.significanthobbies.com/curriculum/concepts/inference-cost-latency.html) — Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request.
- [Local & On-device Inference](https://learn.significanthobbies.com/curriculum/concepts/local-on-device-inference.html) — llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory.
- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime.html) — Web Workers, WASM, OPFS, TypedArrays.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu.html) — WGSL, compute kernels, matmul, CPU parity.

### Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
