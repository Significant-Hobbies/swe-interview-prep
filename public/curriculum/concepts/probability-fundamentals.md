# Probability Fundamentals

Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.

- Difficulty: intro
- Tracks: Mathematics

## Mental model

Probability is a bookkeeping system for uncertainty. Conditional probability restricts the sample space; Bayes flips cause and effect — from 'how likely is the evidence given the hypothesis' to 'how likely is the hypothesis given the evidence'.

## Where it matters

A/B test analysis, spam filtering, medical diagnosis, model calibration.

## Common mistakes

- Treating independent events as mutually exclusive
- Confusing P(A|B) with P(B|A) (the prosecutor's fallacy)
- Adding probabilities of overlapping events without inclusion-exclusion

## Primary sources

- [Khan Academy — Probability](https://www.khanacademy.org/math/statistics-probability/probability-library) (course)
- [MIT 6.041SC — Probabilistic Systems Analysis (course)](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/) (course)
- [Seeing Theory — Basic Probability](https://seeing-theory.brown.edu/basic-probability/index.html) (article)

## Practice

### Apply Bayes' rule

A test has 99% sensitivity and 95% specificity. Disease prevalence is 1%. A patient tests positive. Using Bayes' rule, compute P(disease | positive) to 2 decimal places.

**Expected evidence:** ≈ 0.17 (17%). Most positives are false alarms when the base rate is low.

### Independence and inclusion-exclusion

P(A)=0.4, P(B)=0.5, P(A∩B)=0.2. Are A and B independent? Compute P(A∪B). If they were mutually exclusive, what would P(A∪B) be instead?

**Expected evidence:** P(A)P(B)=0.2=P(A∩B) → independent. P(A∪B)=0.4+0.5−0.2=0.7. Mutually exclusive would give 0.9 — conflating the two is a common bug.

## Review prompts

- State Bayes' rule and when you need it.
- How is independence different from mutual exclusivity?

## Build evidence

- **Simulate coin flips, dice, and random walks** — Code simulators (no stats libraries): Bernoulli trials, dice sums, and a 1D random walk. Plot or print distributions and compare sample mean to theory.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Prerequisites

- None assigned.

## Related concepts

- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html)
- [Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions.html)
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html)
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math.html)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d.html)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
