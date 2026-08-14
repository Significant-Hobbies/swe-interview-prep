# Sampling & the Central Limit Theorem

Sampling distributions, standard error of the mean, and why averages become Normal as n grows.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Your data is one draw from a bigger game. The CLT says sample means from many independent pieces look Normal even when the underlying data is not — which is why confidence intervals and z-tests work on proportions and averages.

## Where it matters

Poll margins of error, experiment power calculations, simulation validation.

## Common mistakes

- Applying CLT with n=5 and calling it rigorous
- Treating the sample as the population
- Ignoring dependence across samples (e.g. time-series)

## Primary sources

- [Seeing Theory — Probability Distributions](https://seeing-theory.brown.edu/probability-distributions/index.html) (article)
- [StatQuest — Central Limit Theorem](https://www.youtube.com/watch?v=YAlJC6Hlv8M) (video)

## Practice

### CLT and required sample size

A/B test on conversion rate: baseline 5%, MDE 1pp (to 6%). Rough rule: need ~16p(1−p)/δ² samples per arm for Normal approx (p=0.05, δ=0.01). Estimate n per arm. Why is n quadratic in 1/δ?

**Expected evidence:** n ≈ 16×0.05×0.95/0.0001 ≈ 7,600 per arm. Halving MDE quadruples required n — detecting small lifts is expensive.

### Standard error vs standard deviation

n=100 samples, sample mean x̄=50, sample SD s=10. Compute SE = s/√n and a 95% CI for the population mean (use z=1.96). Why is SE smaller than s?

**Expected evidence:** SE=10/10=1; CI≈[48.04, 51.96]. SE describes uncertainty of the mean; s describes spread of individual points.

## Review prompts

- What does the Central Limit Theorem say about sample means?
- Standard error vs standard deviation?

## Build evidence

- **Analyze a fake trading signal** — Given (or generate) a spurious 'alpha' signal on synthetic or historical noise, show why it fails: multiple testing, in-sample overfit, or non-stationarity.

## Prerequisites

- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables)
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics)

## Related concepts

- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence)
- [Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions)
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering)

## Learning paths

- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
