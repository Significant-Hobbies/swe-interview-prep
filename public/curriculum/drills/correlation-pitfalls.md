# Correlation pitfalls

> Dataset: ice cream sales and drowning deaths are strongly correlated (r≈0.9). (a) Does ice cream cause drowning? (b) Name the lurking variable. (c) When would correlation still be useful for engineers?

Canonical: https://learn.significanthobbies.com/curriculum/drills/correlation-pitfalls

Dataset: ice cream sales and drowning deaths are strongly correlated (r≈0.9). (a) Does ice cream cause drowning? (b) Name the lurking variable. (c) When would correlation still be useful for engineers?

## The mechanism

Descriptive stats compress a dataset into a few numbers you can reason about. Mean chases outliers; median resists them. Correlation measures linear co-movement, not causation — and breaks under nonlinearity.

## Expected evidence

(a) No — correlation ≠ causation. (b) Summer/temperature drives both. (c) Feature screening, anomaly pairs, quick linear sanity checks — never causal claims.

## Hints

- Look for a confounder that affects both series.
- Correlation measures linear co-movement only.

## Sources and practice

- [Khan Academy — Statistics](https://www.khanacademy.org/math/statistics-probability)
- [Introduction to Modern Statistics — Ch. 5: Exploring numerical data](https://openintro-ims.netlify.app/explore-numerical)
- [Study Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/correlation-pitfalls)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
