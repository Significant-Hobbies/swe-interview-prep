# AI Systems

Practical AI engineering: LLM apps, RAG, chunking, tool calling, agents, evals, and model/transformer foundations.

This track contains 32 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html) — Build a strong retrieval, vector, AI-systems, and storage foundation through HighSignal and Codevetter.
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html) — Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime.html) — Build one cross-cutting mental model for V8, JVM, Go, BEAM, .NET CLR, vLLM, SGLang, Cloudflare Workers, and wasmtime.
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html) — Get a working mental model of every major systems-software domain — LLMs, DBs, streaming, game engines, containers, browsers, compilers, OS, networking, distributed, build, crypto.
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html) — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation.
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html) — Follow one model workload from representation and gradients to memory, kernels, scheduling, and serving economics.

## Concepts

- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html) (core) — Retrieval-Augmented Generation: ground an LLM answer in retrieved context.
- [Chunking](https://learn.significanthobbies.com/curriculum/concepts/chunking.html) (core) — Splitting documents into retrievable units that preserve meaning.
- [Context Packing](https://learn.significanthobbies.com/curriculum/concepts/context-packing.html) (advanced) — Ordering and budgeting retrieved context within the model's window.
- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs.html) (core) — Forcing LLM output into a validated JSON schema.
- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling.html) (core) — Letting an LLM invoke functions/APIs via structured calls.
- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops.html) (advanced) — The plan → act → observe loop, with memory and stopping conditions.
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html) (core) — Sending each request to the cheapest model that can handle it.
- [Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning.html) (core) — Treating prompts as versioned artifacts with logged inputs/outputs.
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals.html) (core) — Measuring LLM output quality with datasets, graders, and LLM-as-judge.
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math.html) (intro) — Vectors, matrices, dot products, matmul, shapes.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html) (core) — Loss surfaces, learning rate, SGD steps.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop.html) (core) — Chain rule, autograd, forward/backward passes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent.html) (core) — Logits to probabilities, negative log-likelihood loss.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw.html) (core) — Moments, weight decay, gradient clipping.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization.html) (intro) — Byte-level, char-level, BPE, vocab design.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling.html) (core) — Next-token prediction, context windows, perplexity.
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling.html) (core) — Temperature, top-k, greedy decoding.
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings.html) (core) — Token & position embeddings, tied weights.
- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention.html) (advanced) — Q/K/V, scaled dot-product, causal masking.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head.html) (advanced) — Parallel heads, head_dim split, output projection.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block.html) (advanced) — Pre-LayerNorm, residuals, MLP, GELU.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training.html) (advanced) — Init, NaNs, overfit tests, gradient checks.
- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing.html) (core) — Weights + optimizer state, resume, dataset manifests.
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora.html) (advanced) — Frozen base, low-rank adapters, rank/alpha.
- [RL Alignment (GRPO & Policy Gradient)](https://learn.significanthobbies.com/curriculum/concepts/ml-rl-alignment.html) (advanced) — Policy gradient, advantages, GRPO/CISPO, on- vs off-policy RLHF.
- [Training Data Engineering](https://learn.significanthobbies.com/curriculum/concepts/ml-data-engineering.html) (core) — Cleaning, dedup, JSONL tasks, memorization tests.
- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime.html) (advanced) — Web Workers, WASM, OPFS, TypedArrays.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu.html) (advanced) — WGSL, compute kernels, matmul, CPU parity.
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation.html) (core) — Held-out loss, baselines, hallucination, leakage.
- [Model Pre-training](https://learn.significanthobbies.com/curriculum/concepts/ml-pretraining.html) (core) — Data mixtures, next-token objectives, scaling laws, distributed training, checkpoints, and training stability.
- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html) (core) — Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.
- [Open-Weight Models](https://learn.significanthobbies.com/curriculum/concepts/open-weight-models.html) (core) — Model cards, licenses, weights, tokenizers, chat templates, adapters, provenance, and reproducible packaging.
