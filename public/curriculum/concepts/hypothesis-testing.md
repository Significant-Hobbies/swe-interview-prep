# Hypothesis Testing

Null and alternative hypotheses, p-values, significance, power, and Type I/II errors.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Hypothesis testing asks: 'how surprising is this data if nothing real changed?' A p-value is not the probability the null is true — it's the probability of seeing data this extreme under the null. Low p → reject the null, but 'not significant' is not proof of no effect.

## Where it matters

Experiment analysis, clinical trials, model comparison gates.

## Common mistakes

- Treating p < 0.05 as proof the effect is real
- Running many tests without correction (p-hacking)
- Confusing statistical significance with practical significance

## Primary sources

- [Seeing Theory — Hypothesis Testing](https://seeing-theory.brown.edu/frequentist-inference/index.html) (article)
- [StatQuest — p-values](https://www.youtube.com/watch?v=vemZtHjaqKA) (video)

## Practice

### Interpret a p-value correctly

An A/B test reports p = 0.03 for H₀: 'no difference in conversion'. The lift is 0.1% absolute (0.5% → 0.6%). Write two sentences: one correct interpretation of the p-value, one reason you might still not ship.

**Expected evidence:** Correct: if there were truly no effect, we'd see data this extreme ~3% of the time. Might not ship: effect is tiny (practical insignificance) or the test was one of many without correction.

### Type I vs Type II errors

A security patch test: H₀ = 'no change in error rate'. You fail to reject H₀, but errors actually rose 0.5%. (a) Which error type? (b) If α=0.05 and power=0.8, what does each number mean in one sentence?

**Expected evidence:** (a) Type II error (false negative) — missed a real regression. α=5% false-alarm rate if H₀ true; power=80% chance to detect a real effect of the assumed size.

## Review prompts

- What is a p-value, and what is it not?
- Define Type I and Type II errors.

## Build evidence

- **A/B test analysis report** — Analyze a mock or real experiment: check SRM, compute CI on the lift, interpret p-value and practical significance, and write a ship/no-ship recommendation.
- **Analyze a fake trading signal** — Given (or generate) a spurious 'alpha' signal on synthetic or historical noise, show why it fails: multiple testing, in-sample overfit, or non-stationarity.
- **Simple momentum backtest vs SPY/QQQ** — 12-month momentum rule on 1–3 names; compare cumulative return to SPY or QQQ over the same window. State assumptions and survivorship bias.

## Prerequisites

- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence)
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals)

## Related concepts

- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics)
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
