# Eigenvalues & Matrix Decomposition

Eigenvectors as directions preserved by a transformation; eigenvalues as stretch factors; SVD as the universal factorization.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

Most matrices scramble space, but eigenvectors are the special directions that only get stretched, not rotated. SVD finds the best low-rank approximation of any matrix — the backbone of PCA and many compression tricks.

## Where it matters

PCA for dimensionality reduction, PageRank, spectral clustering, low-rank embeddings.

## Common mistakes

- Thinking every matrix has real eigenvalues
- Confusing eigenvectors of A with eigenvectors of A^T
- Using PCA without centering the data first

## Primary sources

- [Computational Linear Algebra (fast.ai)](https://github.com/fastai/numerical-linear-algebra) (course)

## Practice

### Interpret an eigenvalue

Matrix A = [[2, 1], [1, 2]] has eigenvector v = [1, 1] with eigenvalue λ = 3. Explain in one sentence what Av looks like geometrically. What is the other eigenvalue of this symmetric matrix?

**Expected evidence:** Av = 3v — v is only stretched by 3, not rotated. The other eigenvalue is 1 (eigenvector [1, -1]).

## Review prompts

- What is an eigenvector, and why does SVD matter?

## Build evidence

- **PCA from scratch** — Center data, compute covariance matrix, eigen-decompose, project to 2D. Visualize.

## Prerequisites

- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations)

## Related concepts

- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
