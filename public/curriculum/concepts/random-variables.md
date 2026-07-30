# Random Variables & Distributions

Discrete and continuous distributions, expectation, variance, and the law of large numbers.

- Difficulty: core
- Tracks: Mathematics

## Mental model

A random variable is a function from outcomes to numbers. Expectation is the long-run average; variance measures spread. The CLT says sums of many independent pieces look Gaussian — which is why normal distributions are everywhere.

## Where it matters

Latency modeling, error bars, Monte Carlo simulation, loss function design.

## Common mistakes

- Confusing the PDF value with a probability (for continuous RVs)
- Assuming small samples look like their population distribution
- Using variance when you mean standard deviation in an explanation

## Primary sources

- [MIT 6.041SC — Probabilistic Systems Analysis (course)](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/) (course)
- [StatQuest — Probability vs Likelihood](https://www.youtube.com/watch?v=pYx9wEc34tY) (video)

## Practice

### Expectation and variance of a discrete RV

X takes values {0, 1, 2} with probabilities {0.2, 0.5, 0.3}. Compute E[X] and Var(X) = E[X²] − (E[X])².

**Expected evidence:** E[X] = 1.1, E[X²] = 1.5, Var(X) = 0.29.

### Normal tail probability

Latency is Normal(μ=100ms, σ=20ms). Approximate P(X > 140ms) using the z-score and a standard normal table (Φ(2) ≈ 0.977). What fraction is within 1σ of the mean?

**Expected evidence:** z=(140−100)/20=2; P(X>140)≈1−0.977=0.023. Within 1σ: ≈68%.

## Review prompts

- How does the sample mean relate to expectation?
- Why is f(x) in a PDF not a probability?

## Build evidence

- **Simulate coin flips, dice, and random walks** — Code simulators (no stats libraries): Bernoulli trials, dice sums, and a 1D random walk. Plot or print distributions and compare sample mean to theory.

## Prerequisites

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html)

## Related concepts

- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html)
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html)
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d.html)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
