# Derivatives & Gradients

Partial derivatives, the gradient vector, and reading a loss surface for descent direction.

- Difficulty: core
- Tracks: Mathematics

## Mental model

The gradient points uphill steepest. To minimize a loss, walk opposite the gradient. Each partial derivative tells you how sensitive the output is to one input — the chain rule chains these sensitivities through composed functions.

## Where it matters

Training neural nets, tuning hyperparameters, sensitivity analysis.

## Common mistakes

- Confusing gradient with the function value
- Forgetting to zero-center data before interpreting partials
- Using a fixed step size on a badly scaled surface

## Primary sources

- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/) (course)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html) (course)
- [Essence of Calculus (3Blue1Brown)](https://www.3blue1brown.com/topics/calculus) (video)

## Practice

### Compute a 2D gradient

f(x, y) = x² + 3xy + y². Compute ∇f at (1, 2). In which direction should you step to decrease f fastest, and what is the directional derivative in that direction?

**Expected evidence:** ∇f = [2x+3y, 3x+2y] → [8, 7] at (1,2). Steepest descent: −∇f/||∇f||. Directional derivative along −∇f/||∇f|| is −||∇f|| = −√113.

## Review prompts

- Why does gradient descent step opposite the gradient?


## Prerequisites

- [Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces)

## Related concepts

- [Multivariable Optimization](https://learn.significanthobbies.com/curriculum/concepts/multivariable-optimization)
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent)
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
