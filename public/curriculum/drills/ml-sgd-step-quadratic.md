# One SGD step on a quadratic

> Loss L(w)=(w−3)². At w=0 with lr=0.1, compute gradient and one gradient-descent update.

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-sgd-step-quadratic

Loss L(w)=(w−3)². At w=0 with lr=0.1, compute gradient and one gradient-descent update.

## The mechanism

Gradient descent is repeated tiny adjustments. At each step you move the weights a small amount in the direction that lowers the loss. The "learning rate" is how big each step is — too big and you overshoot the answer, too small and training crawls.

## Expected evidence

∇L=−6, w₁=0.6.

## Hints

- d/dw (w−3)² = 2(w−3).
- w ← w − lr·∇L.

## Sources and practice

- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/)
- [Gradient descent, how neural networks learn (3Blue1Brown)](https://www.3blue1brown.com/lessons/gradient-descent)
- [Study Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-sgd-step-quadratic)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
