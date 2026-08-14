# Softmax & Cross-Entropy

Logits to probabilities, negative log-likelihood loss.

- Difficulty: core
- Tracks: AI Systems

## Mental model

Softmax turns raw scores (logits) into probabilities that sum to 1. Cross-entropy then measures how wrong those probabilities are versus the true answer. Together they give a clean gradient that backprop can work with.



## Primary sources

- [CS231n — Linear Classification: SVM vs Softmax, cross-entropy loss](https://cs231n.github.io/linear-classify/) (course)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html) (course)
- [Softmax function (Wikipedia)](https://en.wikipedia.org/wiki/Softmax_function) (doc)
- [Cross entropy (Wikipedia)](https://en.wikipedia.org/wiki/Cross_entropy) (doc)

## Practice

### Softmax and cross-entropy loss

Logits [2,1,0.1], true class index 0. Compute softmax probabilities and −log p(true).

**Expected evidence:** p≈[0.659,0.242,0.099], loss≈0.417.

## Review prompts

- Why are softmax and cross-entropy implemented as one fused op rather than two?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math)

## Related concepts

- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
