# Covariance & Correlation

Covariance measures co-movement; correlation normalizes to [−1, 1]. Foundation for regression, PCA, and portfolio risk.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Covariance is signed co-fluctuation with units. Correlation divides by both standard deviations so scale cancels. Zero correlation means no linear relationship, not independence.

## Where it matters

Feature selection, portfolio diversification, multicollinearity checks.

## Common mistakes

- Treating correlation 0 as unrelated when nonlinear dependence exists
- Computing correlation on price levels instead of returns
- Mixing sample n vs n−1 denominators

## Primary sources

- [Seeing Theory — Regression](https://seeing-theory.brown.edu/regression-analysis/index.html) (article)

## Practice

### Compute covariance and correlation matrix

Given 3 aligned series (n=20 each), compute the 3×3 sample covariance matrix and correlation matrix by hand or in code (loops only). Verify diagonal covariances equal variances and corr diagonal = 1.

**Expected evidence:** Symmetric matrices; corr[i,j] = cov[i,j]/(σ_i σ_j).

## Review prompts

- Covariance vs correlation?

## Build evidence

- **Implement mean, variance, correlation from scratch** — On a real CSV (or synthetic data), compute mean, variance, std dev, covariance, and Pearson r without pandas/numpy — loops only.
- **Volatility, Sharpe, drawdown, correlation matrix** — On 2–5 tickers: annualized vol, Sharpe (assume rf=0 or document rate), max drawdown, pairwise correlation matrix.

## Prerequisites

- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html)
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html)

## Related concepts

- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html)
- [Sharpe, Drawdown & Portfolio Risk](https://learn.significanthobbies.com/curriculum/concepts/portfolio-risk-metrics.html)
- [PCA & Projection](https://learn.significanthobbies.com/curriculum/concepts/pca-projection.html)

## Learning paths

- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
