# MLE for Bernoulli trials

> n=100 Bernoulli trials, 55 successes. Write the likelihood L(p)=p^55(1−p)^45, take log, differentiate, and solve for p̂. Why is this the same as the sample proportion?

Canonical: https://learn.significanthobbies.com/curriculum/drills/mle-bernoulli-derivation

n=100 Bernoulli trials, 55 successes. Write the likelihood L(p)=p^55(1−p)^45, take log, differentiate, and solve for p̂. Why is this the same as the sample proportion?

## The mechanism

MLE picks the parameter values that maximize the probability of what you actually saw. Log-likelihood turns products into sums — easier to optimize. Minimizing cross-entropy on classification data is MLE under a Bernoulli/categorical model.

## Expected evidence

p̂=55/100=0.55. Log-likelihood derivative gives successes/n — MLE equals the intuitive estimator here.

## Hints

- log L = 55 log p + 45 log(1−p) + const.
- Set d/dp = 0.

## Sources and practice

- [StatQuest — Maximum Likelihood](https://www.youtube.com/watch?v=XepXbq9wr90)
- [Study Maximum Likelihood Estimation](https://learn.significanthobbies.com/curriculum/concepts/maximum-likelihood)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/mle-bernoulli-derivation)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
