# 30-Day Probability & Statistics

Daily (5d/wk): 45m concepts (canonical externals) + 45m problems + 15m notes. Every week ships code or a writeup. External-heavy (Seeing Theory, MIT OCW, StatQuest, ISL). Not aesthetic math — the gym is solving, simulating, checking assumptions.

- Horizon: 30d
- Outcome: Active probability & statistics — solve, derive, implement. No passive video watching as a substitute for problems.
- Tracks: Mathematics

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [Combinatorics](https://learn.significanthobbies.com/curriculum/concepts/combinatorics.html) — Counting without enumerating — permutations, combinations, inclusion-exclusion, pigeonhole.
- [Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces.html) — Vectors as ordered lists, dot products, norms, orthogonality, and the geometric picture of n-dimensional space.
- [Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients.html) — Partial derivatives, the gradient vector, and reading a loss surface for descent direction.
- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations.html) — Matrix multiplication as composing linear maps: rotation, scaling, projection, and change of basis.



## Milestone 2: Week 1 — Probability

Conditional probability, distributions, expectation — the language of uncertainty.

### Concepts

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html) — Discrete and continuous distributions, expectation, variance, and the law of large numbers.
- [Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions.html) — Bernoulli, Binomial, Poisson, Normal, and Exponential — when each models the world and what to expect from them.

### Build evidence

- **Simulate coin flips, dice, and random walks** — Code simulators (no stats libraries): Bernoulli trials, dice sums, and a 1D random walk. Plot or print distributions and compare sample mean to theory.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 3: Week 2 — Summaries & sampling

Describe data honestly; understand why averages become Normal.

### Concepts

- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation.html) — Covariance measures co-movement; correlation normalizes to [−1, 1]. Foundation for regression, PCA, and portfolio risk.
- [Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt.html) — Sampling distributions, standard error of the mean, and why averages become Normal as n grows.
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html) — Point estimates, standard error, confidence intervals, and what '95% confident' actually means.

### Build evidence

- **Implement mean, variance, correlation from scratch** — On a real CSV (or synthetic data), compute mean, variance, std dev, covariance, and Pearson r without pandas/numpy — loops only.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 4: Week 3 — Inference & experiments

Hypothesis tests, regression, and real A/B practice for SWE.

### Concepts

- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html) — Null and alternative hypotheses, p-values, significance, power, and Type I/II errors.
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering.html) — Sample size, statistical power, practical significance, SRM checks, and multiple-comparison traps in product experiments.
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html) — Fitting a line (or hyperplane) by least squares; residuals, R², and the geometry of projection.
- [Bias, Variance & Overfitting](https://learn.significanthobbies.com/curriculum/concepts/bias-variance-overfitting.html) — Underfitting vs memorizing noise; why in-sample greatness lies.

### Build evidence

- **A/B test analysis report** — Analyze a mock or real experiment: check SRM, compute CI on the lift, interpret p-value and practical significance, and write a ship/no-ship recommendation.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 5: Week 4 — Bayesian & likelihood

Posterior thinking and MLE — the bridge to ML loss functions.

### Concepts

- [Bayesian Inference](https://learn.significanthobbies.com/curriculum/concepts/bayesian-inference.html) — Priors, posteriors, credible intervals, and when Bayesian updating beats frequentist tests.
- [Maximum Likelihood Estimation](https://learn.significanthobbies.com/curriculum/concepts/maximum-likelihood.html) — Choosing parameters that make the observed data most probable; log-likelihood; connection to cross-entropy loss.
- [Information & Entropy](https://learn.significanthobbies.com/curriculum/concepts/information-entropy.html) — Entropy as surprise, cross-entropy as a loss, KL divergence as a distributional distance.

### Build evidence

- **Analyze a fake trading signal** — Given (or generate) a spurious 'alpha' signal on synthetic or historical noise, show why it fails: multiple testing, in-sample overfit, or non-stationarity.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.
