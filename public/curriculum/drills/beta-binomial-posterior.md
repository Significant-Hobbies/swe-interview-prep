# Beta-Binomial posterior update

> Prior: Beta(1,1) (uniform) on conversion rate θ. Observe 8 successes in 100 trials. Compute the posterior Beta(9,93). Give the posterior mean and a 95% credible interval (approximate with Normal: mean ± 1.96√(pq/(n+2))).

Canonical: https://learn.significanthobbies.com/curriculum/drills/beta-binomial-posterior

Prior: Beta(1,1) (uniform) on conversion rate θ. Observe 8 successes in 100 trials. Compute the posterior Beta(9,93). Give the posterior mean and a 95% credible interval (approximate with Normal: mean ± 1.96√(pq/(n+2))).

## The mechanism

Frequentist stats ask how surprising the data is under a null. Bayesian stats start with a prior belief, observe data, and land on a posterior — a direct distribution over what you care about. Credible intervals are 'where the parameter probably lives' given data and prior.

## Expected evidence

Posterior mean = 9/102 ≈ 0.088; CI roughly [0.035, 0.141] — direct 'where θ probably lives' statement.

## Hints

- Beta(a,b) + s successes, f failures → Beta(a+s, b+f).
- Posterior mean = α/(α+β).

## Sources and practice

- [Seeing Theory — Bayesian Inference](https://seeing-theory.brown.edu/bayesian-inference/index.html)
- [Statistical Rethinking (McElreath) — lectures](https://www.youtube.com/playlist?list=PLDcUM9US4vMnmGIyY4KZdH_3H9v2EEW3U)
- [Study Bayesian Inference](https://learn.significanthobbies.com/curriculum/concepts/bayesian-inference)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/beta-binomial-posterior)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
