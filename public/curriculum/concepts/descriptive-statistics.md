# Descriptive Statistics

Summarizing data: mean, median, variance, correlation, and when each summary lies.

- Difficulty: intro
- Tracks: Mathematics

## Mental model

Descriptive stats compress a dataset into a few numbers you can reason about. Mean chases outliers; median resists them. Correlation measures linear co-movement, not causation — and breaks under nonlinearity.

## Where it matters

Dashboards, experiment readouts, data profiling before modeling.

## Common mistakes

- Using mean on heavy-tailed latency data
- Treating correlation as causation
- Reporting precision without sample size

## Primary sources

- [Khan Academy — Statistics](https://www.khanacademy.org/math/statistics-probability) (course)
- [Introduction to Modern Statistics — Ch. 5: Exploring numerical data](https://openintro-ims.netlify.app/explore-numerical) (article)

## Practice

### Summarize a small dataset

Latency samples (ms): 12, 14, 15, 16, 200. Compute mean, median, and sample standard deviation. Which summary is misleading for SLA reporting and why?

**Expected evidence:** Mean ≈ 51.4 (pulled by outlier), median = 15 (robust), std dev is large. Report median + p95 for SLAs, not mean.

### Correlation pitfalls

Dataset: ice cream sales and drowning deaths are strongly correlated (r≈0.9). (a) Does ice cream cause drowning? (b) Name the lurking variable. (c) When would correlation still be useful for engineers?

**Expected evidence:** (a) No — correlation ≠ causation. (b) Summer/temperature drives both. (c) Feature screening, anomaly pairs, quick linear sanity checks — never causal claims.

## Review prompts

- When should you report median instead of mean?
- Why does correlation not imply causation?

## Build evidence

- **Implement mean, variance, correlation from scratch** — On a real CSV (or synthetic data), compute mean, variance, std dev, covariance, and Pearson r without pandas/numpy — loops only.

## Prerequisites

- None assigned.

## Related concepts

- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables)
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
