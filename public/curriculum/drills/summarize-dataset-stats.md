# Summarize a small dataset

> Latency samples (ms): 12, 14, 15, 16, 200. Compute mean, median, and sample standard deviation. Which summary is misleading for SLA reporting and why?

Canonical: https://learn.significanthobbies.com/curriculum/drills/summarize-dataset-stats

Latency samples (ms): 12, 14, 15, 16, 200. Compute mean, median, and sample standard deviation. Which summary is misleading for SLA reporting and why?

## The mechanism

Descriptive stats compress a dataset into a few numbers you can reason about. Mean chases outliers; median resists them. Correlation measures linear co-movement, not causation — and breaks under nonlinearity.

## Expected evidence

Mean ≈ 51.4 (pulled by outlier), median = 15 (robust), std dev is large. Report median + p95 for SLAs, not mean.

## Hints

- Sort for median.
- One outlier dominates the mean.

## Sources and practice

- [Khan Academy — Statistics](https://www.khanacademy.org/math/statistics-probability)
- [Introduction to Modern Statistics — Ch. 5: Exploring numerical data](https://openintro-ims.netlify.app/explore-numerical)
- [Study Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/summarize-dataset-stats)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
