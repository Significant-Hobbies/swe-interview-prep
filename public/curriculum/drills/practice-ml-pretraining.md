# Design exercise: Model Pre-training

> Data mixtures, next-token objectives, scaling laws, distributed training, checkpoints, and training stability. Implement designOutline() returning non-empty values for: dataMixture, trainingLoop, scalingPlan. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-ml-pretraining

Data mixtures, next-token objectives, scaling laws, distributed training, checkpoints, and training stability. Implement designOutline() returning non-empty values for: dataMixture, trainingLoop, scalingPlan. Each value must name a concrete mechanism or decision.

## The mechanism

Pre-training converts data and compute into general capability. The core loop is data sampling, forward/backward passes, optimizer updates, checkpointing, and continuous loss/quality diagnosis.

## Expected evidence

A design outline with dataMixture, trainingLoop, scalingPlan plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Stanford CS336 — Language Modeling from Scratch](https://cs336.stanford.edu/)
- [Study Model Pre-training](https://learn.significanthobbies.com/curriculum/concepts/ml-pretraining)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-ml-pretraining)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
