# Debias clicks by inverse propensity

> Implement debiasedCtr(events, propensity) where events are {docId, position, clicked} and propensity maps position -> probability of examination. Return docId -> estimated relevance = (sum of clicks / propensity[position]) / (number of impressions). Round each value to 4 decimals.

Canonical: https://learn.significanthobbies.com/curriculum/drills/ipw-debias-clicks

Implement debiasedCtr(events, propensity) where events are {docId, position, clicked} and propensity maps position -> probability of examination. Return docId -> estimated relevance = (sum of clicks / propensity[position]) / (number of impressions). Round each value to 4 decimals.

## The mechanism

A click means the user examined the result AND judged it worth clicking, so the observed rate confounds relevance with position — rank 1 gets clicked far more than rank 5 for identical content. Training on raw clicks therefore teaches the model to reproduce the ranking that generated them, a feedback loop that entrenches whatever was already on top. Inverse-propensity weighting breaks it by dividing each click by the estimated probability that the position was examined, which is why deliberate result randomisation is worth its cost.

## Expected evidence

A doc clicked 1/10 times at position 1 (p=1.0) scores lower than one clicked 1/10 times at position 5 (p=0.2).

## Hints

- Weight each CLICK by 1/propensity, then divide by impressions — not by the sum of weights.
- The whole point is that a click from a rarely-examined position is stronger evidence.

## Sources and practice


- [Study Click Models & Position Bias](https://learn.significanthobbies.com/curriculum/concepts/click-models)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ipw-debias-clicks)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
