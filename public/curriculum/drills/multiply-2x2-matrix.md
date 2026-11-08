# Multiply 2×2 matrices by hand

> Compute AB where A = [[1, 2], [0, 1]] and B = [[1, 0], [3, 1]]. Then apply A to vector x = [1, 1] and B to the result — does AB·x equal A·(B·x)?

Canonical: https://learn.significanthobbies.com/curriculum/drills/multiply-2x2-matrix

Compute AB where A = [[1, 2], [0, 1]] and B = [[1, 0], [3, 1]]. Then apply A to vector x = [1, 1] and B to the result — does AB·x equal A·(B·x)?

## The mechanism

A matrix is a machine that takes vectors in and pushes vectors out. Columns tell you where the basis vectors land. Matrix multiply chains machines — output of one feeds the next.

## Expected evidence

AB = [[7, 2], [3, 1]]; AB·x = [9, 4] = A·(B·x). Matrix multiplication is composition.

## Hints

- Row × column for each entry.
- Order matters: AB ≠ BA in general.

## Sources and practice

- [MIT 18.06 Linear Algebra (Strang)](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)
- [Study Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/multiply-2x2-matrix)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
