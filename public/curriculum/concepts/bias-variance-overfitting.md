# Bias, Variance & Overfitting

Underfitting vs memorizing noise; why in-sample greatness lies.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Bias is systematic error from too-simple a model; variance is sensitivity to which sample you drew. Overfitting is low bias + high variance. The gym is holdout validation, not training R².

## Where it matters

ML training, backtest overfitting, feature discipline.

## Common mistakes

- Tuning on the test set
- Chasing training loss without validation
- Equating complex with better

## Primary sources

- [StatQuest — Bias and Variance](https://www.youtube.com/watch?v=EuBBz3bI-aA) (video)

## Practice

### Diagnose overfit with a train/holdout split

Fit a degree-1 vs degree-5 polynomial to 30 noisy points (50/50 split). Report train vs holdout MSE for both. Which overfits and how do you know?

**Expected evidence:** Degree-5 lower train MSE, worse holdout MSE — classic overfit signature.

## Review prompts

- Explain the bias-variance tradeoff.

## Build evidence

- **Analyze a fake trading signal** — Given (or generate) a spurious 'alpha' signal on synthetic or historical noise, show why it fails: multiple testing, in-sample overfit, or non-stationarity.

## Prerequisites

- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)
- [Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt)

## Related concepts

- [Maximum Likelihood Estimation](https://learn.significanthobbies.com/curriculum/concepts/maximum-likelihood)
- [Multivariable Optimization](https://learn.significanthobbies.com/curriculum/concepts/multivariable-optimization)
- [Momentum Backtest Discipline](https://learn.significanthobbies.com/curriculum/concepts/momentum-backtest)

## Learning paths

- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
