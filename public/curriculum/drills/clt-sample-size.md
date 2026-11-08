# CLT and required sample size

> A/B test on conversion rate: baseline 5%, MDE 1pp (to 6%). Rough rule: need ~16p(1−p)/δ² samples per arm for Normal approx (p=0.05, δ=0.01). Estimate n per arm. Why is n quadratic in 1/δ?

Canonical: https://learn.significanthobbies.com/curriculum/drills/clt-sample-size

A/B test on conversion rate: baseline 5%, MDE 1pp (to 6%). Rough rule: need ~16p(1−p)/δ² samples per arm for Normal approx (p=0.05, δ=0.01). Estimate n per arm. Why is n quadratic in 1/δ?

## The mechanism

Your data is one draw from a bigger game. The CLT says sample means from many independent pieces look Normal even when the underlying data is not — which is why confidence intervals and z-tests work on proportions and averages.

## Expected evidence

n ≈ 16×0.05×0.95/0.0001 ≈ 7,600 per arm. Halving MDE quadruples required n — detecting small lifts is expensive.

## Hints

- Standard error of proportion shrinks as 1/√n.
- Smaller δ → need more data to separate signal from noise.

## Sources and practice

- [Seeing Theory — Probability Distributions](https://seeing-theory.brown.edu/probability-distributions/index.html)
- [StatQuest — Central Limit Theorem](https://www.youtube.com/watch?v=YAlJC6Hlv8M)
- [Study Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/clt-sample-size)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
