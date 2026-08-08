# Backpropagation

Chain rule, autograd, forward/backward passes.

- Difficulty: core
- Tracks: AI Systems

## Mental model

Backpropagation is how the network learns: compute the error at the output, then push that error backwards through each layer using the chain rule from calculus. You reuse values from the forward pass so you do not have to recompute them.



## Primary sources

- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html) (course)
- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/) (course)
- [micrograd — backprop from scratch (Karpathy)](https://www.youtube.com/watch?v=VMj-3S1tku0) (video)

## Practice

### Chain rule on a tiny graph

y = (2x+1)³. Compute dy/dx at x=1 via chain rule (u=2x+1, y=u³).

**Expected evidence:** dy/dx = 6(2x+1)² → 54 at x=1.

## Review prompts

- Why does the backward pass need values cached from the forward pass, and what does that cost?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html)

## Related concepts

- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw.html)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html)
