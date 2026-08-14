# PCA & Projection

Principal components as variance-maximizing orthogonal directions; projection as subspace approximation.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

PCA finds an orthogonal basis ordered by variance. Top-k projection is the best k-dimensional summary in squared-error sense. Center first.

## Where it matters

Dimensionality reduction, visualization, noise filtering.

## Common mistakes

- PCA on uncentered data
- Components without domain meaning
- PCA for prediction without care

## Primary sources

- [StatQuest — PCA](https://www.youtube.com/watch?v=FgakZw6K1QQ) (video)
- [A Tutorial on Principal Component Analysis (Shlens)](https://arxiv.org/abs/1404.1100) (paper)

## Practice

### PCA variance explained

2D data with cov matrix [[4,3],[3,9]]. Eigenvalues are 10 and 3. What fraction of variance do the top 1 and top 2 components explain? Why center before PCA?

**Expected evidence:** PC1: 10/13≈77%; both: 100%. Centering removes the mean offset so variance is spread, not dominated by the origin.

## Review prompts

- Why is PCA a projection?

## Build evidence

- **PCA from scratch** — Center data, compute covariance matrix, eigen-decompose, project to 2D. Visualize.
- **Visualize linear projections** — Draw vector projection onto a line/subspace: show orthogonal residual. Connect to OLS geometry.

## Prerequisites

- [Eigenvalues & Matrix Decomposition](https://learn.significanthobbies.com/curriculum/concepts/eigenvalues-decomposition)
- [Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation)
- [Rank, Basis & Subspaces](https://learn.significanthobbies.com/curriculum/concepts/matrix-rank-basis)

## Related concepts

- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings)
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
