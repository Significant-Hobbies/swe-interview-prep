# AdamW vs L2-on-gradient

> Weight w=2, grad=0.5, lr=0.1, decay=0.01. Compare one step: (a) L2 in gradient w−lr·(grad+decay·w) vs (b) AdamW-style w−lr·grad then w·(1−lr·decay).

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-adamw-weight-decay

Weight w=2, grad=0.5, lr=0.1, decay=0.01. Compare one step: (a) L2 in gradient w−lr·(grad+decay·w) vs (b) AdamW-style w−lr·grad then w·(1−lr·decay).

## The mechanism

AdamW is the standard optimizer for training transformers. It adapts the learning rate per parameter (Adam) and applies weight decay separately from the gradient (the "W"). The default choice unless you have a reason to switch.

## Expected evidence

Both ≈ 1.948 (L2 1.94800, decoupled 1.94805). One step barely separates them — the point is that decoupled decay never enters the gradient, so it is not rescaled by the adaptive step.

## Hints

- Coupled L2 adds decay·w to the gradient.
- AdamW applies decay directly on weights.

## Sources and practice

- [Decoupled Weight Decay Regularization (Loshchilov & Hutter)](https://arxiv.org/abs/1711.05101)
- [CS231n — Neural Networks 3: Adam and learning-rate schedules](https://cs231n.github.io/neural-networks-3/)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [Study AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-adamw-weight-decay)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
