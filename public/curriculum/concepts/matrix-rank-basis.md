# Rank, Basis & Subspaces

Column space, rank, independence — why matrices are often low-rank in practice.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Rank counts independent directions the matrix reaches. Regression lives in the column space of X; residuals are orthogonal to that subspace.

## Where it matters

PCA, embeddings, recommender factorizations.

## Common mistakes

- Confusing rank with row count
- OLS when X is rank-deficient
- Ignoring near-collinearity

## Primary sources

- [3Blue1Brown — Span and linear independence](https://www.3blue1brown.com/lessons/span) (video)

## Practice

### Identify rank and column space

A = [[1,2,3],[2,4,6],[1,1,0]]. What is rank(A)? Describe the column space in one sentence. Can you solve Ax=b for b=(3,6,2)?

**Expected evidence:** rank=2 (row2=2×row1). Column space is span{(1,2,1),(2,4,1)}. Ax=b consistent — b is in column space.

## Review prompts

- What is matrix rank?


## Prerequisites

- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations)

## Related concepts

- [PCA & Projection](https://learn.significanthobbies.com/curriculum/concepts/pca-projection)
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)
- [Eigenvalues & Matrix Decomposition](https://learn.significanthobbies.com/curriculum/concepts/eigenvalues-decomposition)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
