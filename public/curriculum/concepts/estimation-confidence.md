# Estimation & Confidence Intervals

Point estimates, standard error, confidence intervals, and what '95% confident' actually means.

- Difficulty: core
- Tracks: Mathematics

## Mental model

A confidence interval is a procedure, not a probability statement about one interval. If you repeated the experiment many times, 95% of the intervals you'd construct would contain the true parameter. Wider interval = more uncertainty or less data.

## Where it matters

A/B test reporting, polling margins of error, model metric uncertainty.

## Common mistakes

- Saying 'there is a 95% chance the true value is in this interval'
- Using the normal approximation with tiny samples
- Ignoring that CI width grows with desired confidence level

## Primary sources

- [MIT 18.650 Statistics for Applications](https://ocw.mit.edu/courses/mathematics/18-650-statistics-for-applications-fall-2016/) (course)

## Practice

### Construct a 95% confidence interval

n = 100 coin flips, 55 heads. Assuming a normal approximation, construct a 95% CI for the true heads probability p. (Use z = 1.96.)

**Expected evidence:** p̂ = 0.55, SE ≈ 0.0498, CI ≈ [0.452, 0.648].

## Review prompts

- What does a 95% confidence interval mean?

## Build evidence

- **A/B test analysis report** — Analyze a mock or real experiment: check SRM, compute CI on the lift, interpret p-value and practical significance, and write a ship/no-ship recommendation.

## Prerequisites

- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html)
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html)

## Related concepts

- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html)
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d.html)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
