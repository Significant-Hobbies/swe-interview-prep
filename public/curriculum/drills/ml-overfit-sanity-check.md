# Overfit a single batch sanity check

> Training loss stuck high on 1 batch of 8 examples. Name two data bugs to check before changing the architecture.

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-overfit-sanity-check

Training loss stuck high on 1 batch of 8 examples. Name two data bugs to check before changing the architecture.

## The mechanism

A training loop is forward pass → loss → backward pass → optimizer step, repeated over batches of data. When training looks broken, the data is the usual culprit (leaked, mislabeled, wrong shape) — check it before blaming the model.

## Expected evidence

Wrong labels/shapes, train-eval leakage, broken tokenizer, masked tokens all padding, etc.

## Hints

- Karpathy recipe: overfit one batch first.
- If you cannot overfit one batch, data or loss is wrong.

## Sources and practice

- [Stanford CS336 — L2 PyTorch & resource accounting (Spring 2025)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_02.json)
- [CS336 Assignment 2 — Systems (profile, Triton, distributed training)](https://github.com/stanford-cs336/assignment2-systems/tree/main)
- [A Recipe for Training Neural Networks (Karpathy)](https://karpathy.github.io/2019/04/25/recipe/)
- [The Illustrated GPT-2 — training a language model](https://jalammar.github.io/illustrated-gpt2/)
- [Let's reproduce GPT-2 (124M) — Karpathy](https://www.youtube.com/watch?v=l8pRSuU81PU)
- [Stanford CS336 — L9–11 Scaling laws (Spring 2025)](https://github.com/stanford-cs336/assignment3-scaling/tree/main)
- [How to Scale Your Model (JAX ML scaling book)](https://jax-ml.github.io/scaling-book/)
- [Study Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-overfit-sanity-check)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
