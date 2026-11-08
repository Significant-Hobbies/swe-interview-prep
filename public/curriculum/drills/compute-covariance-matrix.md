# Compute covariance and correlation matrix

> Given 3 aligned series (n=20 each), compute the 3×3 sample covariance matrix and correlation matrix by hand or in code (loops only). Verify diagonal covariances equal variances and corr diagonal = 1.

Canonical: https://learn.significanthobbies.com/curriculum/drills/compute-covariance-matrix

Given 3 aligned series (n=20 each), compute the 3×3 sample covariance matrix and correlation matrix by hand or in code (loops only). Verify diagonal covariances equal variances and corr diagonal = 1.

## The mechanism

Covariance is signed co-fluctuation with units. Correlation divides by both standard deviations so scale cancels. Zero correlation means no linear relationship, not independence.

## Expected evidence

Symmetric matrices; corr[i,j] = cov[i,j]/(σ_i σ_j).

## Hints

- Center each series first for covariance.
- Correlation is scale-free.

## Sources and practice

- [Seeing Theory — Regression](https://seeing-theory.brown.edu/regression-analysis/index.html)
- [Study Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/compute-covariance-matrix)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
