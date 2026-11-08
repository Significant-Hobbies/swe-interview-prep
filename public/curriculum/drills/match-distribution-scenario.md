# Match distribution to scenario

> For each scenario, name the best distribution: (1) 10,000 coin flips, count heads. (2) Rare server crashes, ~2 per day. (3) Time until next request in a Poisson stream. (4) Average of 500 independent user latencies.

Canonical: https://learn.significanthobbies.com/curriculum/drills/match-distribution-scenario

For each scenario, name the best distribution: (1) 10,000 coin flips, count heads. (2) Rare server crashes, ~2 per day. (3) Time until next request in a Poisson stream. (4) Average of 500 independent user latencies.

## The mechanism

Distributions are reusable uncertainty templates. Bernoulli/Binomial for yes/no counts; Poisson for rare events in fixed windows; Normal for sums of many small pieces (CLT); Exponential for waiting times between events.

## Expected evidence

(1) Binomial (≈Normal for large n). (2) Poisson. (3) Exponential. (4) Normal for the sample mean (CLT).

## Hints

- Counts with fixed trials → Binomial.
- Waiting times → Exponential; rare counts in window → Poisson.

## Sources and practice

- [Seeing Theory — Probability Distributions](https://seeing-theory.brown.edu/probability-distributions/index.html)
- [Khan Academy — Random variables & distributions](https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library)
- [MIT 18.05 — Probability & Statistics (Spring 2022)](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/)
- [Study Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/match-distribution-scenario)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
