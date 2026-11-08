# Compute a 2D gradient

> f(x, y) = x² + 3xy + y². Compute ∇f at (1, 2). In which direction should you step to decrease f fastest, and what is the directional derivative in that direction?

Canonical: https://learn.significanthobbies.com/curriculum/drills/compute-gradient-2d

f(x, y) = x² + 3xy + y². Compute ∇f at (1, 2). In which direction should you step to decrease f fastest, and what is the directional derivative in that direction?

## The mechanism

The gradient points uphill steepest. To minimize a loss, walk opposite the gradient. Each partial derivative tells you how sensitive the output is to one input — the chain rule chains these sensitivities through composed functions.

## Expected evidence

∇f = [2x+3y, 3x+2y] → [8, 7] at (1,2). Steepest descent: −∇f/||∇f||. Directional derivative along −∇f/||∇f|| is −||∇f|| = −√113.

## Hints

- Partial w.r.t. x treats y as constant.
- Steepest descent is opposite the gradient.

## Sources and practice

- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [Essence of Calculus (3Blue1Brown)](https://www.3blue1brown.com/topics/calculus)
- [Study Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/compute-gradient-2d)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
