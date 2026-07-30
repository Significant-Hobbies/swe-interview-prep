# Linear Regression

Fitting a line (or hyperplane) by least squares; residuals, R², and the geometry of projection.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Linear regression finds the best linear predictor — geometrically, it projects the target vector onto the column space of your features. Least squares minimizes squared error, which is why outliers pull the line hard.

## Where it matters

Forecasting, feature importance, baseline models before deep learning.

## Common mistakes

- Extrapolating far outside the training range
- Treating high R² as proof of causation
- Ignoring multicollinearity among features

## Primary sources

- [An Introduction to Statistical Learning — full text (PDF)](https://www.statlearning.com/s/ISLR-Seventh-Printing.pdf) (paper)
- [Stanford CS229 — Main lecture notes (linear regression, least squares)](https://cs229.stanford.edu/main_notes.pdf) (course)
- [MIT 18.06 L16 — Projection matrices and least squares (Strang)](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-16-projection-matrices-and-least-squares/) (video)
- [The Truth About Linear Regression (Cosma Shalizi, CMU)](https://www.stat.cmu.edu/~cshalizi/TALR/TALR.pdf) (doc)

## Practice

### Fit a simple linear regression

Points: (1, 2), (2, 3), (3, 5). Fit y = a + bx by least squares. Compute a, b, and the predicted ŷ at x = 4.

**Expected evidence:** b ≈ 1.5, a ≈ 0.17, ŷ(4) ≈ 6.17. (Exact: b = 3/2, a = 1/6.)

## Review prompts

- Why is least-squares regression called a projection?

## Build evidence

- **Least-squares regression from scratch** — Fit y = Xβ via normal equations (XᵀX)β = Xᵀy using your matmul — no sklearn. Report β, residuals, R².

## Prerequisites

- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations.html)
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html)

## Related concepts

- [Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients.html)
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html)
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d.html)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
