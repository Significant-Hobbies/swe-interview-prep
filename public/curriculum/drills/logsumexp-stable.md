# Log-sum-exp without overflow

> Implement logSumExp(xs) returning log(sum(exp(x))) that stays finite for large inputs by subtracting the maximum first. Must return a finite number for [1000, 1001, 1002], where the naive form overflows to Infinity.

Canonical: https://learn.significanthobbies.com/curriculum/drills/logsumexp-stable

Implement logSumExp(xs) returning log(sum(exp(x))) that stays finite for large inputs by subtracting the maximum first. Must return a finite number for [1000, 1001, 1002], where the naive form overflows to Infinity.

## The mechanism

Floating point stores a fixed number of significant digits, so error is relative, not absolute — and subtracting two nearly equal numbers throws away the leading digits that agreed, leaving noise promoted to the front. That is catastrophic cancellation, and it is why the naive variance formula and the quadratic formula both fail. The standard fixes are algebraic rather than numerical: reorder to avoid the subtraction, or shift into a domain where the range is safe, which is exactly what log-sum-exp does by subtracting the max before exponentiating.

## Expected evidence

logSumExp([1000,1001,1002]) ~ 1002.4076; logSumExp([0,0]) ~ 0.6931

## Hints

- log(sum(exp(x))) = m + log(sum(exp(x - m))) where m is the max — algebraically identical, numerically safe.
- Handle an all -Infinity input without producing NaN.

## Sources and practice


- [Study Numerical Stability](https://learn.significanthobbies.com/curriculum/concepts/numerical-stability)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/logsumexp-stable)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
