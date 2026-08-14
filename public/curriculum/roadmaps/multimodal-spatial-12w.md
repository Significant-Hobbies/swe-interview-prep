# 12-Week Multimodal & Spatial Computing

Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI.
- Tracks: Multimodal & Spatial Computing, Inference & Serving

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math) — Vectors, matrices, dot products, matmul, shapes.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent) — Loss surfaces, learning rate, SGD steps.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop) — Chain rule, autograd, forward/backward passes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent) — Logits to probabilities, negative log-likelihood loss.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw) — Moments, weight decay, gradient clipping.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization) — Byte-level, char-level, BPE, vocab design.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling) — Next-token prediction, context windows, perplexity.
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings) — Token & position embeddings, tied weights.
- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention) — Q/K/V, scaled dot-product, causal masking.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head) — Parallel heads, head_dim split, output projection.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block) — Pre-LayerNorm, residuals, MLP, GELU.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training) — Init, NaNs, overfit tests, gradient checks.
- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing) — Weights + optimizer state, resume, dataset manifests.
- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime) — Web Workers, WASM, OPFS, TypedArrays.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Training Data Engineering](https://learn.significanthobbies.com/curriculum/concepts/ml-data-engineering) — Cleaning, dedup, JSONL tasks, memorization tests.
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora) — Frozen base, low-rank adapters, rank/alpha.
- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization) — Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.
- [Multimodal Models](https://learn.significanthobbies.com/curriculum/concepts/multimodal-models) — Joint text, image, audio, and video representations, encoders, projectors, fusion, generation, and cross-modal evaluation.
- [Vision Models](https://learn.significanthobbies.com/curriculum/concepts/vision-models) — Classification, detection, segmentation, embeddings, vision transformers, data augmentation, and visual evaluation.
- [Voice & Audio Systems](https://learn.significanthobbies.com/curriculum/concepts/voice-audio-systems) — Capture, codecs, streaming, speech recognition, synthesis, turn detection, noise handling, latency, and conversational UX.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [Pose & Motion Tracking](https://learn.significanthobbies.com/curriculum/concepts/pose-motion-tracking) — Landmarks, skeletons, optical flow, temporal smoothing, identity tracking, calibration, occlusion, and latency.
- [Image & Video Generation](https://learn.significanthobbies.com/curriculum/concepts/image-video-generation) — Diffusion and transformer generation, conditioning, latent spaces, control, consistency, safety, and media evaluation.
- [Local & On-device Inference](https://learn.significanthobbies.com/curriculum/concepts/local-on-device-inference) — llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [Robotics Systems](https://learn.significanthobbies.com/curriculum/concepts/robotics-systems) — Sensing, localization, mapping, planning, control, simulation, safety, real-time loops, and hardware interfaces.
- [Spatial Interfaces](https://learn.significanthobbies.com/curriculum/concepts/spatial-interfaces) — Coordinate systems, anchors, tracking, depth, occlusion, hand/eye input, world understanding, and spatial UI.
- [Human-Computer Interaction](https://learn.significanthobbies.com/curriculum/concepts/human-computer-interaction) — Human perception, cognition, motor control, interaction techniques, accessibility, evaluation, and responsible design.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu) — WGSL, compute kernels, matmul, CPU parity.

### Build evidence

- **Synthesize: Multimodal & Spatial Computing** — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI. Produce one working system, benchmark, or evidence-backed design that integrates the path.
