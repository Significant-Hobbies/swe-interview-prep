# Classical Distributions

Bernoulli, Binomial, Poisson, Normal, and Exponential — when each models the world and what to expect from them.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Distributions are reusable uncertainty templates. Bernoulli/Binomial for yes/no counts; Poisson for rare events in fixed windows; Normal for sums of many small pieces (CLT); Exponential for waiting times between events.

## Where it matters

Queue depth modeling, click-through rates, error counts, latency approximations.

## Common mistakes

- Using a Normal model on tiny counts or heavy tails
- Confusing Poisson rate λ with probability
- Applying Binomial when trials are not independent

## Primary sources

- [Seeing Theory — Probability Distributions](https://seeing-theory.brown.edu/probability-distributions/index.html) (article)
- [Khan Academy — Random variables & distributions](https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library) (course)
- [MIT 18.05 — Probability & Statistics (Spring 2022)](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/) (course)

## Practice

### Match distribution to scenario

For each scenario, name the best distribution: (1) 10,000 coin flips, count heads. (2) Rare server crashes, ~2 per day. (3) Time until next request in a Poisson stream. (4) Average of 500 independent user latencies.

**Expected evidence:** (1) Binomial (≈Normal for large n). (2) Poisson. (3) Exponential. (4) Normal for the sample mean (CLT).

## Review prompts

- When use Poisson instead of Binomial?
- When is a Normal approximation reasonable for a Binomial?


## Prerequisites

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals)
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables)

## Related concepts

- [Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt)
- [Maximum Likelihood Estimation](https://learn.significanthobbies.com/curriculum/concepts/maximum-likelihood)
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling)

## Learning paths

- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
