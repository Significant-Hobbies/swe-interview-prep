# LoRA & PEFT

Frozen base, low-rank adapters, rank/alpha.

- Difficulty: advanced
- Tracks: AI Systems

## Mental model

LoRA fine-tunes a big model cheaply by adding small trainable matrices alongside the frozen weights. You only update around 1% of the parameters yet get most of the quality of full fine-tuning, and you can swap adapters at inference time.



## Primary sources

- [Stanford CS336 — L15 Alignment: SFT & RLHF (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/61eddac004df975466cff0329b615f2d24230069/nonexecutable/2025%20Lecture%2015%20-%20RLHF%20Alignment.pdf) (paper)
- [CS336 Assignment 5 — Alignment & reasoning RL](https://github.com/stanford-cs336/assignment5-alignment) (doc)
- [LoRA: Low-Rank Adaptation (Hu et al.)](https://arxiv.org/abs/2106.09685) (paper)
- [HuggingFace PEFT — LoRA guide](https://huggingface.co/docs/peft/en/conceptual_guides/lora) (doc)
- [How to Scale Your Model (JAX ML scaling book)](https://jax-ml.github.io/scaling-book/) (course)

## Practice

### LoRA parameter count

W is 4096×4096 (frozen). LoRA rank r=8. How many trainable params in A (4096×r) and B (r×4096)?

**Expected evidence:** 4096·8 + 8·4096 = 65,536 trainable vs 16M full matrix.

## Review prompts

- What do rank r and alpha each control in LoRA, and what does r actually limit?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Multimodal & Spatial Computing** — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training.html)

## Related concepts

- [Training Data Engineering](https://learn.significanthobbies.com/curriculum/concepts/ml-data-engineering.html)
- [RL Alignment (GRPO & Policy Gradient)](https://learn.significanthobbies.com/curriculum/concepts/ml-rl-alignment.html)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
