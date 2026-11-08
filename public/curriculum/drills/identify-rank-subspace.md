# Identify rank and column space

> A = [[1,2,3],[2,4,6],[1,1,0]]. What is rank(A)? Describe the column space in one sentence. Can you solve Ax=b for b=(3,6,2)?

Canonical: https://learn.significanthobbies.com/curriculum/drills/identify-rank-subspace

A = [[1,2,3],[2,4,6],[1,1,0]]. What is rank(A)? Describe the column space in one sentence. Can you solve Ax=b for b=(3,6,2)?

## The mechanism

Rank counts independent directions the matrix reaches. Regression lives in the column space of X; residuals are orthogonal to that subspace.

## Expected evidence

rank=2 (row2=2×row1). Column space is span{(1,2,1),(2,4,1)}. Ax=b consistent — b is in column space.

## Hints

- Row reduction reveals pivot columns.
- b must be a linear combo of columns.

## Sources and practice

- [3Blue1Brown — Span and linear independence](https://www.3blue1brown.com/lessons/span)
- [Study Rank, Basis & Subspaces](https://learn.significanthobbies.com/curriculum/concepts/matrix-rank-basis)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/identify-rank-subspace)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
