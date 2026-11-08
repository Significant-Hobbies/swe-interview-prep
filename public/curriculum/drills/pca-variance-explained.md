# PCA variance explained

> 2D data with cov matrix [[4,3],[3,9]]. Eigenvalues are 10 and 3. What fraction of variance do the top 1 and top 2 components explain? Why center before PCA?

Canonical: https://learn.significanthobbies.com/curriculum/drills/pca-variance-explained

2D data with cov matrix [[4,3],[3,9]]. Eigenvalues are 10 and 3. What fraction of variance do the top 1 and top 2 components explain? Why center before PCA?

## The mechanism

PCA finds an orthogonal basis ordered by variance. Top-k projection is the best k-dimensional summary in squared-error sense. Center first.

## Expected evidence

PC1: 10/13≈77%; both: 100%. Centering removes the mean offset so variance is spread, not dominated by the origin.

## Hints

- Variance explained = λ_i / Σλ.
- Uncentered PCA chases the mean.

## Sources and practice

- [StatQuest — PCA](https://www.youtube.com/watch?v=FgakZw6K1QQ)
- [A Tutorial on Principal Component Analysis (Shlens)](https://arxiv.org/abs/1404.1100)
- [Study PCA & Projection](https://learn.significanthobbies.com/curriculum/concepts/pca-projection)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/pca-variance-explained)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
