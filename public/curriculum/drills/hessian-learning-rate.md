# Condition number and learning rate

> Loss Hessian eigenvalues 1 and 100. Why one global lr=0.1 struggles? What helps?

Canonical: https://learn.significanthobbies.com/curriculum/drills/hessian-learning-rate

Loss Hessian eigenvalues 1 and 100. Why one global lr=0.1 struggles? What helps?

## The mechanism

Convexity buys you one thing: no local minimum that is not also global. It does not promise a unique minimizer (a flat valley has many), nor that a minimum exists at all (e^-x descends forever), nor that gradient descent converges — too large a step still diverges, and an ill-conditioned Hessian still crawls. Most neural losses are non-convex yet empirically tractable. Constraints (Lagrange multipliers) turn 'find the best point' into 'find the best point on this boundary'.

## Expected evidence

Ill-conditioned — oscillates along high-curvature dir; use Adam/normalization/smaller lr.

## Hints

- Curvature varies by direction.
- Adaptive per-parameter methods help.

## Sources and practice

- [Convex Optimization (Boyd & Vandenberghe)](https://web.stanford.edu/~boyd/cvxbook/)
- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [Study Multivariable Optimization](https://learn.significanthobbies.com/curriculum/concepts/multivariable-optimization)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/hessian-learning-rate)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
