# Fit a simple linear regression

> Points: (1, 2), (2, 3), (3, 5). Fit y = a + bx by least squares. Compute a, b, and the predicted ŷ at x = 4.

Canonical: https://learn.significanthobbies.com/curriculum/drills/fit-simple-regression

Points: (1, 2), (2, 3), (3, 5). Fit y = a + bx by least squares. Compute a, b, and the predicted ŷ at x = 4.

## The mechanism

Linear regression finds the best linear predictor — geometrically, it projects the target vector onto the column space of your features. Least squares minimizes squared error, which is why outliers pull the line hard.

## Expected evidence

b ≈ 1.5, a ≈ 0.17, ŷ(4) ≈ 6.17. (Exact: b = 3/2, a = 1/6.)

## Hints

- b = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)².
- a = ȳ − b·x̄.

## Sources and practice

- [An Introduction to Statistical Learning — full text (PDF)](https://www.statlearning.com/s/ISLR-Seventh-Printing.pdf)
- [Stanford CS229 — Main lecture notes (linear regression, least squares)](https://cs229.stanford.edu/main_notes.pdf)
- [MIT 18.06 L16 — Projection matrices and least squares (Strang)](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-16-projection-matrices-and-least-squares/)
- [The Truth About Linear Regression (Cosma Shalizi, CMU)](https://www.stat.cmu.edu/~cshalizi/TALR/TALR.pdf)
- [Study Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/fit-simple-regression)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
