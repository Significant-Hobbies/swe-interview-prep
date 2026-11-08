# Checkpoint must include optimizer state

> You save weights only (no optimizer state) at step 10k, resume training. What goes wrong with Adam momentum estimates?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-checkpoint-resume

You save weights only (no optimizer state) at step 10k, resume training. What goes wrong with Adam momentum estimates?

## The mechanism

A checkpoint saves the weights and optimizer state so you can resume after a crash. Save often enough that any single failure costs less than an hour. Keep the most recent few and your best-eval-score one separately.

## Expected evidence

Optimizer moments reset — loss spike / different trajectory; effective warmup replay.

## Hints

- Adam stores m and v per parameter.
- Resume needs weights + optimizer + step + RNG if exact replay.

## Sources and practice

- [CS336 Assignment 2 — Distributed training & checkpointing](https://github.com/stanford-cs336/assignment2-systems/tree/main)
- [Saving & loading models (PyTorch)](https://pytorch.org/tutorials/beginner/saving_loading_models.html)
- [Study Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-checkpoint-resume)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
