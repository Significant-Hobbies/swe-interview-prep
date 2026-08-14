# Checkpointing

Weights + optimizer state, resume, dataset manifests.

- Difficulty: core
- Tracks: AI Systems

## Mental model

A checkpoint saves the weights and optimizer state so you can resume after a crash. Save often enough that any single failure costs less than an hour. Keep the most recent few and your best-eval-score one separately.



## Primary sources

- [CS336 Assignment 2 — Distributed training & checkpointing](https://github.com/stanford-cs336/assignment2-systems/tree/main) (doc)
- [Saving & loading models (PyTorch)](https://pytorch.org/tutorials/beginner/saving_loading_models.html) (doc)

## Practice

### Checkpoint must include optimizer state

You save weights only (no optimizer state) at step 10k, resume training. What goes wrong with Adam momentum estimates?

**Expected evidence:** Optimizer moments reset — loss spike / different trajectory; effective warmup replay.

## Review prompts

- Why is saving only the weights not enough to resume training?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training)

## Related concepts

- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
