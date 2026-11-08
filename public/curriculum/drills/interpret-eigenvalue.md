# Interpret an eigenvalue

> Matrix A = [[2, 1], [1, 2]] has eigenvector v = [1, 1] with eigenvalue λ = 3. Explain in one sentence what Av looks like geometrically. What is the other eigenvalue of this symmetric matrix?

Canonical: https://learn.significanthobbies.com/curriculum/drills/interpret-eigenvalue

Matrix A = [[2, 1], [1, 2]] has eigenvector v = [1, 1] with eigenvalue λ = 3. Explain in one sentence what Av looks like geometrically. What is the other eigenvalue of this symmetric matrix?

## The mechanism

Most matrices scramble space, but eigenvectors are the special directions that only get stretched, not rotated. SVD finds the best low-rank approximation of any matrix — the backbone of PCA and many compression tricks.

## Expected evidence

Av = 3v — v is only stretched by 3, not rotated. The other eigenvalue is 1 (eigenvector [1, -1]).

## Hints

- Eigenvectors are fixed directions under the map.
- Trace = sum of eigenvalues for 2×2.

## Sources and practice

- [Computational Linear Algebra (fast.ai)](https://github.com/fastai/numerical-linear-algebra)
- [Study Eigenvalues & Matrix Decomposition](https://learn.significanthobbies.com/curriculum/concepts/eigenvalues-decomposition)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/interpret-eigenvalue)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
