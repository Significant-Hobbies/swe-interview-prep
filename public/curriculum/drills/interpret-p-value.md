# Interpret a p-value correctly

> An A/B test reports p = 0.03 for H₀: 'no difference in conversion'. The lift is 0.1% absolute (0.5% → 0.6%). Write two sentences: one correct interpretation of the p-value, one reason you might still not ship.

Canonical: https://learn.significanthobbies.com/curriculum/drills/interpret-p-value

An A/B test reports p = 0.03 for H₀: 'no difference in conversion'. The lift is 0.1% absolute (0.5% → 0.6%). Write two sentences: one correct interpretation of the p-value, one reason you might still not ship.

## The mechanism

Hypothesis testing asks: 'how surprising is this data if nothing real changed?' A p-value is not the probability the null is true — it's the probability of seeing data this extreme under the null. Low p → reject the null, but 'not significant' is not proof of no effect.

## Expected evidence

Correct: if there were truly no effect, we'd see data this extreme ~3% of the time. Might not ship: effect is tiny (practical insignificance) or the test was one of many without correction.

## Hints

- p-value is about the null, not P(null is true).
- Statistical ≠ practical significance.

## Sources and practice

- [Seeing Theory — Hypothesis Testing](https://seeing-theory.brown.edu/frequentist-inference/index.html)
- [StatQuest — p-values](https://www.youtube.com/watch?v=vemZtHjaqKA)
- [Study Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/interpret-p-value)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
