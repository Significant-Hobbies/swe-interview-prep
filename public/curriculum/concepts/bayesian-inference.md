# Bayesian Inference

Priors, posteriors, credible intervals, and when Bayesian updating beats frequentist tests.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

Frequentist stats ask how surprising the data is under a null. Bayesian stats start with a prior belief, observe data, and land on a posterior — a direct distribution over what you care about. Credible intervals are 'where the parameter probably lives' given data and prior.

## Where it matters

Low-data regimes, adaptive experiments, spam filtering, hierarchical models.

## Common mistakes

- Treating the prior as truth instead of a starting opinion
- Confusing credible intervals with confidence intervals
- Using flat priors and expecting magic objectivity

## Primary sources

- [Seeing Theory — Bayesian Inference](https://seeing-theory.brown.edu/bayesian-inference/index.html) (article)
- [Statistical Rethinking (McElreath) — lectures](https://www.youtube.com/playlist?list=PLDcUM9US4vMnmGIyY4KZdH_3H9v2EEW3U) (video)

## Practice

### Beta-Binomial posterior update

Prior: Beta(1,1) (uniform) on conversion rate θ. Observe 8 successes in 100 trials. Compute the posterior Beta(9,93). Give the posterior mean and a 95% credible interval (approximate with Normal: mean ± 1.96√(pq/(n+2))).

**Expected evidence:** Posterior mean = 9/102 ≈ 0.088; CI roughly [0.035, 0.141] — direct 'where θ probably lives' statement.

## Review prompts

- Credible interval vs confidence interval?
- When is Bayesian inference especially useful?


## Prerequisites

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html)
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html)
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html)

## Related concepts

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html)
- [Maximum Likelihood Estimation](https://learn.significanthobbies.com/curriculum/concepts/maximum-likelihood.html)
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation.html)

## Learning paths

- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
