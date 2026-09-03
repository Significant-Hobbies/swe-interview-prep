# AdamW Optimizer

Moments, weight decay, gradient clipping.

- Difficulty: core
- Tracks: AI Systems

## Mental model

AdamW is the standard optimizer for training transformers. It adapts the learning rate per parameter (Adam) and applies weight decay separately from the gradient (the "W"). The default choice unless you have a reason to switch.



## Primary sources

- [Decoupled Weight Decay Regularization (Loshchilov & Hutter)](https://arxiv.org/abs/1711.05101) (paper)
- [CS231n — Neural Networks 3: Adam and learning-rate schedules](https://cs231n.github.io/neural-networks-3/) (course)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html) (course)

## Practice

### AdamW vs L2-on-gradient

Weight w=2, grad=0.5, lr=0.1, decay=0.01. Compare one step: (a) L2 in gradient w−lr·(grad+decay·w) vs (b) AdamW-style w−lr·grad then w·(1−lr·decay).

**Expected evidence:** Both ≈ 1.948 (L2 1.94800, decoupled 1.94805). One step barely separates them — the point is that decoupled decay never enters the gradient, so it is not rescaled by the adaptive step.

## Review prompts

- What does the W in AdamW change, and why did plain Adam plus L2 not do the same thing?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop)

## Related concepts

- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
