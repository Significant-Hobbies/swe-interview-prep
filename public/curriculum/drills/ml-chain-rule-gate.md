# Chain rule on a tiny graph

> y = (2x+1)³. Compute dy/dx at x=1 via chain rule (u=2x+1, y=u³).

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-chain-rule-gate

y = (2x+1)³. Compute dy/dx at x=1 via chain rule (u=2x+1, y=u³).

## The mechanism

Backpropagation is how the network learns: compute the error at the output, then push that error backwards through each layer using the chain rule from calculus. You reuse values from the forward pass so you do not have to recompute them.

## Expected evidence

dy/dx = 6(2x+1)² → 54 at x=1.

## Hints

- dy/dx = dy/du · du/dx.
- du/dx = 2.

## Sources and practice

- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [CS231n — Backpropagation & computational graphs](https://cs231n.github.io/optimization-2/)
- [micrograd — backprop from scratch (Karpathy)](https://www.youtube.com/watch?v=VMj-3S1tku0)
- [Study Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-chain-rule-gate)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
