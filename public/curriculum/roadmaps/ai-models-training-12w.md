# 12-Week AI Models & Training

Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation.
- Tracks: AI Systems

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling) — Temperature, top-k, greedy decoding.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math) — Vectors, matrices, dot products, matmul, shapes.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent) — Loss surfaces, learning rate, SGD steps.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop) — Chain rule, autograd, forward/backward passes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent) — Logits to probabilities, negative log-likelihood loss.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization) — Byte-level, char-level, BPE, vocab design.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling) — Next-token prediction, context windows, perplexity.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings) — Token & position embeddings, tied weights.
- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention) — Q/K/V, scaled dot-product, causal masking.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head) — Parallel heads, head_dim split, output projection.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block) — Pre-LayerNorm, residuals, MLP, GELU.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw) — Moments, weight decay, gradient clipping.
- [Model Pre-training](https://learn.significanthobbies.com/curriculum/concepts/ml-pretraining) — Data mixtures, next-token objectives, scaling laws, distributed training, checkpoints, and training stability.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training) — Init, NaNs, overfit tests, gradient checks.
- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing) — Weights + optimizer state, resume, dataset manifests.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora) — Frozen base, low-rank adapters, rank/alpha.
- [RL Alignment (GRPO & Policy Gradient)](https://learn.significanthobbies.com/curriculum/concepts/ml-rl-alignment) — Policy gradient, advantages, GRPO/CISPO, on- vs off-policy RLHF.
- [Training Data Engineering](https://learn.significanthobbies.com/curriculum/concepts/ml-data-engineering) — Cleaning, dedup, JSONL tasks, memorization tests.
- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization) — Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.
- [Open-Weight Models](https://learn.significanthobbies.com/curriculum/concepts/open-weight-models) — Model cards, licenses, weights, tokenizers, chat templates, adapters, provenance, and reproducible packaging.
- [Multimodal Models](https://learn.significanthobbies.com/curriculum/concepts/multimodal-models) — Joint text, image, audio, and video representations, encoders, projectors, fusion, generation, and cross-modal evaluation.
- [Vision Models](https://learn.significanthobbies.com/curriculum/concepts/vision-models) — Classification, detection, segmentation, embeddings, vision transformers, data augmentation, and visual evaluation.
- [Voice & Audio Systems](https://learn.significanthobbies.com/curriculum/concepts/voice-audio-systems) — Capture, codecs, streaming, speech recognition, synthesis, turn detection, noise handling, latency, and conversational UX.
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation) — Held-out loss, baselines, hallucination, leakage.

### Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.
