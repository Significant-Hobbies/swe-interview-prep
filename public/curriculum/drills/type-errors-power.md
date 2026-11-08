# Type I vs Type II errors

> A security patch test: H₀ = 'no change in error rate'. You fail to reject H₀, but errors actually rose 0.5%. (a) Which error type? (b) If α=0.05 and power=0.8, what does each number mean in one sentence?

Canonical: https://learn.significanthobbies.com/curriculum/drills/type-errors-power

A security patch test: H₀ = 'no change in error rate'. You fail to reject H₀, but errors actually rose 0.5%. (a) Which error type? (b) If α=0.05 and power=0.8, what does each number mean in one sentence?

## The mechanism

Hypothesis testing asks: 'how surprising is this data if nothing real changed?' A p-value is not the probability the null is true — it's the probability of seeing data this extreme under the null. Low p → reject the null, but 'not significant' is not proof of no effect.

## Expected evidence

(a) Type II error (false negative) — missed a real regression. α=5% false-alarm rate if H₀ true; power=80% chance to detect a real effect of the assumed size.

## Hints

- Type I: reject true H₀. Type II: fail to reject false H₀.
- Power = 1 − P(Type II) for a specific alternative.

## Sources and practice

- [Seeing Theory — Hypothesis Testing](https://seeing-theory.brown.edu/frequentist-inference/index.html)
- [StatQuest — p-values](https://www.youtube.com/watch?v=vemZtHjaqKA)
- [Study Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/type-errors-power)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
