# Numerical Stability

Floating point, catastrophic cancellation, and the log-sum-exp trick.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Floating point stores a fixed number of significant digits, so error is relative, not absolute — and subtracting two nearly equal numbers throws away the leading digits that agreed, leaving noise promoted to the front. That is catastrophic cancellation, and it is why the naive variance formula and the quadratic formula both fail. The standard fixes are algebraic rather than numerical: reorder to avoid the subtraction, or shift into a domain where the range is safe, which is exactly what log-sum-exp does by subtracting the max before exponentiating.

## Where it matters

Every softmax and log-likelihood in a training loop, and financial code where a cent of drift compounds.

## Common mistakes

- Comparing floats with ==; use a tolerance scaled to the magnitude, not an absolute epsilon
- Summing a long series left to right, letting small terms vanish against a large running total
- Exponentiating raw logits and overflowing before the softmax normalises
- Assuming double precision hides the problem — it postpones cancellation, it does not prevent it

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Log-sum-exp without overflow

Implement logSumExp(xs) returning log(sum(exp(x))) that stays finite for large inputs by subtracting the maximum first. Must return a finite number for [1000, 1001, 1002], where the naive form overflows to Infinity.

**Expected evidence:** logSumExp([1000,1001,1002]) ~ 1002.4076; logSumExp([0,0]) ~ 0.6931

## Review prompts

- Subtracting two nearly equal floats is called catastrophic. What exactly is lost, and why does using doubles only postpone it?


## Prerequisites

- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math)

## Related concepts

- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent)
- [Multivariable Optimization](https://learn.significanthobbies.com/curriculum/concepts/multivariable-optimization)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
