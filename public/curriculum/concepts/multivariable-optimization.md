# Multivariable Optimization

Convexity, critical points, constrained optimization, and why SGD works on non-convex losses anyway.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

Convexity buys you one thing: no local minimum that is not also global. It does not promise a unique minimizer (a flat valley has many), nor that a minimum exists at all (e^-x descends forever), nor that gradient descent converges — too large a step still diverges, and an ill-conditioned Hessian still crawls. Most neural losses are non-convex yet empirically tractable. Constraints (Lagrange multipliers) turn 'find the best point' into 'find the best point on this boundary'.

## Where it matters

Hyperparameter search, constrained resource allocation, training dynamics analysis.

## Common mistakes

- Assuming every critical point is a minimum
- Ignoring learning rate when the Hessian is ill-conditioned
- Treating SGD convergence theory as guaranteeing global minima

## Primary sources

- [Convex Optimization (Boyd & Vandenberghe)](https://web.stanford.edu/~boyd/cvxbook/) (doc)
- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/) (course)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html) (course)

## Practice

### Condition number and learning rate

Loss Hessian eigenvalues 1 and 100. Why one global lr=0.1 struggles? What helps?

**Expected evidence:** Ill-conditioned — oscillates along high-curvature dir; use Adam/normalization/smaller lr.

## Review prompts

- Convexity makes optimisation easier — but what exactly does it guarantee, and what does it not?


## Prerequisites

- [Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients.html)
- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations.html)

## Related concepts

- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html)
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw.html)
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
