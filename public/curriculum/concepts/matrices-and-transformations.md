# Matrices & Linear Transformations

Matrix multiplication as composing linear maps: rotation, scaling, projection, and change of basis.

- Difficulty: intro
- Tracks: Mathematics

## Mental model

A matrix is a machine that takes vectors in and pushes vectors out. Columns tell you where the basis vectors land. Matrix multiply chains machines — output of one feeds the next.

## Where it matters

Neural network layers, image transforms, PCA, solving linear systems.

## Common mistakes

- Multiplying matrices in the wrong order (not commutative)
- Confusing rows vs columns when reading a transformation
- Assuming every square matrix is invertible

## Primary sources

- [MIT 18.06 Linear Algebra (Strang)](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/) (course)

## Practice

### Multiply 2×2 matrices by hand

Compute AB where A = [[1, 2], [0, 1]] and B = [[1, 0], [3, 1]]. Then apply A to vector x = [1, 1] and B to the result — does AB·x equal A·(B·x)?

**Expected evidence:** AB = [[7, 2], [3, 1]]; AB·x = [9, 4] = A·(B·x). Matrix multiplication is composition.

## Review prompts

- How do the columns of a matrix relate to a linear transformation?

## Build evidence

- **Implement matrix multiplication from scratch** — General m×n by n×p matmul with nested loops; apply to a 2D rotation + scale transform on points.
- **Least-squares regression from scratch** — Fit y = Xβ via normal equations (XᵀX)β = Xᵀy using your matmul — no sklearn. Report β, residuals, R².

## Prerequisites

- [Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces)

## Related concepts

- [Eigenvalues & Matrix Decomposition](https://learn.significanthobbies.com/curriculum/concepts/eigenvalues-decomposition)
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
