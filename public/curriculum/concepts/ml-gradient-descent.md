# Gradient Descent

Loss surfaces, learning rate, SGD steps.

- Difficulty: core
- Tracks: AI Systems

## Mental model

Gradient descent is repeated tiny adjustments. At each step you move the weights a small amount in the direction that lowers the loss. The "learning rate" is how big each step is — too big and you overshoot the answer, too small and training crawls.



## Primary sources

- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html) (course)
- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/) (course)
- [Gradient descent, how neural networks learn (3Blue1Brown)](https://www.3blue1brown.com/lessons/gradient-descent) (video)

## Practice

### One SGD step on a quadratic

Loss L(w)=(w−3)². At w=0 with lr=0.1, compute gradient and one gradient-descent update.

**Expected evidence:** ∇L=−6, w₁=0.6.

## Review prompts

- Loss goes down for a while, then spikes to NaN. What does that pattern point at first?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math)

## Related concepts

- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
