# Click Models & Position Bias

Why clicks are not relevance labels, and how to debias implicit feedback.

- Difficulty: advanced
- Tracks: Search & IR

## Mental model

A click means the user examined the result AND judged it worth clicking, so the observed rate confounds relevance with position — rank 1 gets clicked far more than rank 5 for identical content. Training on raw clicks therefore teaches the model to reproduce the ranking that generated them, a feedback loop that entrenches whatever was already on top. Inverse-propensity weighting breaks it by dividing each click by the estimated probability that the position was examined, which is why deliberate result randomisation is worth its cost.

## Where it matters

Every search team's offline evaluation, and the reason interleaving experiments beat naive CTR comparisons.

## Common mistakes

- Treating click-through rate as a relevance label and locking in the incumbent ranking
- Estimating position bias from the same log the ranker produced, with no randomisation to identify it
- Ignoring that a click is not satisfaction — a fast return to the results page is evidence against it
- Comparing CTR across layouts, where the examination probability changed too

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Debias clicks by inverse propensity

Implement debiasedCtr(events, propensity) where events are {docId, position, clicked} and propensity maps position -> probability of examination. Return docId -> estimated relevance = (sum of clicks / propensity[position]) / (number of impressions). Round each value to 4 decimals.

**Expected evidence:** A doc clicked 1/10 times at position 1 (p=1.0) scores lower than one clicked 1/10 times at position 5 (p=0.2).

## Review prompts

- A team trains its ranker on click-through rate and the ranking gets more entrenched each cycle. Explain the loop and the standard correction.


## Prerequisites

- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals)

## Related concepts

- [Learning to Rank](https://learn.significanthobbies.com/curriculum/concepts/learning-to-rank)
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
