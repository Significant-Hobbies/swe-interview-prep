# Training & Debugging

Init, NaNs, overfit tests, gradient checks.

- Difficulty: advanced
- Tracks: AI Systems

## Mental model

A training loop is forward pass → loss → backward pass → optimizer step, repeated over batches of data. When training looks broken, the data is the usual culprit (leaked, mislabeled, wrong shape) — check it before blaming the model.



## Primary sources

- [Stanford CS336 — L2 PyTorch & resource accounting (Spring 2025)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_02.json) (course)
- [CS336 Assignment 2 — Systems (profile, Triton, distributed training)](https://github.com/stanford-cs336/assignment2-systems/tree/main) (doc)
- [A Recipe for Training Neural Networks (Karpathy)](https://karpathy.github.io/2019/04/25/recipe/) (article)
- [The Illustrated GPT-2 — training a language model](https://jalammar.github.io/illustrated-gpt2/) (article)
- [Let's reproduce GPT-2 (124M) — Karpathy](https://www.youtube.com/watch?v=l8pRSuU81PU) (video)
- [Stanford CS336 — L9–11 Scaling laws (Spring 2025)](https://github.com/stanford-cs336/assignment3-scaling/tree/main) (doc)
- [How to Scale Your Model (JAX ML scaling book)](https://jax-ml.github.io/scaling-book/) (course)

## Practice

### Overfit a single batch sanity check

Training loss stuck high on 1 batch of 8 examples. Name two data bugs to check before changing the architecture.

**Expected evidence:** Wrong labels/shapes, train-eval leakage, broken tokenizer, masked tokens all padding, etc.

## Review prompts

- What is the single fastest sanity check that your training loop is wired correctly?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block)

## Related concepts

- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing)
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
