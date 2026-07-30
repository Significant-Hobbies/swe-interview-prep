# A/B Testing for Engineers

Sample size, statistical power, practical significance, SRM checks, and multiple-comparison traps in product experiments.

- Difficulty: core
- Tracks: Mathematics

## Mental model

An A/B test is a hypothesis test with a deployment budget. Power asks whether you'd detect a real effect; practical significance asks whether the effect matters; SRM catches broken randomization before you trust the p-value.

## Where it matters

Feature flags, model rollouts, ranking changes, pricing experiments.

## Common mistakes

- Peeking at results and stopping early when p < 0.05
- Ignoring sample ratio mismatch (SRM)
- Shipping a statistically significant but tiny lift
- Running dozens of metrics without correction

## Primary sources

- [Evan Miller — Sample Size Calculator](https://www.evanmiller.org/ab-testing/sample-size.html) (doc)
- [Microsoft ExP platform paper](https://arxiv.org/abs/1803.03218) (paper)
- [Spotify — New Experimentation Platform, Part 2 (validity checks & SRM)](https://engineering.atspotify.com/2020/11/spotifys-new-experimentation-platform-part-2) (article)

## Practice

### Design an A/B test with power

You want to test a new ranking model on search CTR (baseline 8%, hope for +0.5pp). Define: primary metric, MDE, α, target power, estimated n per arm, duration given 50k daily users split 50/50, peeking policy, and guardrail metrics.

**Expected evidence:** A one-page test plan with n≈7k+ per arm (similar proportion formula), ~3–4 days runtime, no peeking until fixed n, guardrails on latency and null-result rate.

### Interpret a sample ratio mismatch

Planned 50/50 split; after 24h you observe 52% control / 48% treatment (n=100k total). χ² test flags SRM at p=0.001. What do you do before trusting the CTR lift?

**Expected evidence:** Stop the test readout; investigate bucketing bugs, bot traffic, locale skew, or deployment issues. Do not ship on a broken randomization.

## Review prompts

- Why is peeking at A/B results mid-test dangerous?
- Statistical significance vs statistical power?

## Build evidence

- **A/B test analysis report** — Analyze a mock or real experiment: check SRM, compute CI on the lift, interpret p-value and practical significance, and write a ship/no-ship recommendation.

## Prerequisites

- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html)
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html)
- [Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt.html)

## Related concepts

- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals.html)
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals.html)
- [Product Analytics](https://learn.significanthobbies.com/curriculum/concepts/product-analytics.html)
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation.html)

## Learning paths

- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
