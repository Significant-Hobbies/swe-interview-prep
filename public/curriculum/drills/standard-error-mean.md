# Standard error vs standard deviation

> n=100 samples, sample mean x̄=50, sample SD s=10. Compute SE = s/√n and a 95% CI for the population mean (use z=1.96). Why is SE smaller than s?

Canonical: https://learn.significanthobbies.com/curriculum/drills/standard-error-mean

n=100 samples, sample mean x̄=50, sample SD s=10. Compute SE = s/√n and a 95% CI for the population mean (use z=1.96). Why is SE smaller than s?

## The mechanism

Your data is one draw from a bigger game. The CLT says sample means from many independent pieces look Normal even when the underlying data is not — which is why confidence intervals and z-tests work on proportions and averages.

## Expected evidence

SE=10/10=1; CI≈[48.04, 51.96]. SE describes uncertainty of the mean; s describes spread of individual points.

## Hints

- SE = s/√n.
- CI = x̄ ± z·SE.

## Sources and practice

- [Seeing Theory — Probability Distributions](https://seeing-theory.brown.edu/probability-distributions/index.html)
- [StatQuest — Central Limit Theorem](https://www.youtube.com/watch?v=YAlJC6Hlv8M)
- [Study Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/standard-error-mean)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
