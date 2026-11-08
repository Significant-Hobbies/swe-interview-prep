# Diagnose overfit with a train/holdout split

> Fit a degree-1 vs degree-5 polynomial to 30 noisy points (50/50 split). Report train vs holdout MSE for both. Which overfits and how do you know?

Canonical: https://learn.significanthobbies.com/curriculum/drills/diagnose-overfit-split

Fit a degree-1 vs degree-5 polynomial to 30 noisy points (50/50 split). Report train vs holdout MSE for both. Which overfits and how do you know?

## The mechanism

Bias is systematic error from too-simple a model; variance is sensitivity to which sample you drew. Overfitting is low bias + high variance. The gym is holdout validation, not training R².

## Expected evidence

Degree-5 lower train MSE, worse holdout MSE — classic overfit signature.

## Hints

- Same random split for both models.
- MSE on holdout is the honest score.

## Sources and practice

- [StatQuest — Bias and Variance](https://www.youtube.com/watch?v=EuBBz3bI-aA)
- [Study Bias, Variance & Overfitting](https://learn.significanthobbies.com/curriculum/concepts/bias-variance-overfitting)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/diagnose-overfit-split)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
