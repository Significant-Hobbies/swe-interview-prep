# 12-Week Active Math Stack

5 days/week: 90m math + 30m implementation. Weeks 1–4 probability & statistics (simulate, implement stats, debunk fake signals). Weeks 5–8 linear algebra (matmul, OLS, PCA from scratch). Weeks 9–12 quant bridge (returns, vol, Sharpe, drawdown, momentum backtest vs SPY/QQQ). One public note per week. No artifact = no learning.

- Horizon: 12mo
- Outcome: Math → AI systems → distributed/data → quant tools. Active only: solve, derive, implement, simulate — never aesthetic consumption.
- Tracks: Mathematics

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Week 1 — Probability gym

Conditional probability, Bayes, distributions — plus simulate random processes.

### Concepts

- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math.html) — Vectors, matrices, dot products, matmul, shapes.
- [Combinatorics](https://learn.significanthobbies.com/curriculum/concepts/combinatorics.html) — Counting without enumerating — permutations, combinations, inclusion-exclusion, pigeonhole.
- [Numerical Stability](https://learn.significanthobbies.com/curriculum/concepts/numerical-stability.html) — Floating point, catastrophic cancellation, and the log-sum-exp trick.
- [Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory.html) — Little's law and the utilisation curve — why latency explodes before a system runs out of capacity.
- [Curse of Dimensionality](https://learn.significanthobbies.com/curriculum/concepts/curse-of-dimensionality.html) — Why distances concentrate in high dimensions, and what that does to nearest-neighbour search.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions.html) — Bernoulli, Binomial, Poisson, Normal, and Exponential — when each models the world and what to expect from them.
- [Random Walks & Markov Chains](https://learn.significanthobbies.com/curriculum/concepts/random-walks-markov.html) — Markov property, random walks, transition matrices — generative story behind market efficiency intuition.

### Build evidence

- **Simulate coin flips, dice, and random walks** — Code simulators (no stats libraries): Bernoulli trials, dice sums, and a 1D random walk. Plot or print distributions and compare sample mean to theory.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 2: Week 2 — Expectation & summaries

RVs, expectation, variance — implement descriptive stats from scratch.

### Concepts

- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html) — Discrete and continuous distributions, expectation, variance, and the law of large numbers.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation.html) — Covariance measures co-movement; correlation normalizes to [−1, 1]. Foundation for regression, PCA, and portfolio risk.

### Build evidence

- **Implement mean, variance, correlation from scratch** — On a real CSV (or synthetic data), compute mean, variance, std dev, covariance, and Pearson r without pandas/numpy — loops only.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 3: Week 3 — Sampling & CI

CLT, standard error, confidence intervals.

### Concepts

- [Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt.html) — Sampling distributions, standard error of the mean, and why averages become Normal as n grows.
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html) — Point estimates, standard error, confidence intervals, and what '95% confident' actually means.

### Build evidence

- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 4: Week 4 — Inference & overfitting

Hypothesis tests, A/B testing, regression, bias-variance — debunk a fake signal.

### Concepts

- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html) — Null and alternative hypotheses, p-values, significance, power, and Type I/II errors.
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering.html) — Sample size, statistical power, practical significance, SRM checks, and multiple-comparison traps in product experiments.
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html) — Fitting a line (or hyperplane) by least squares; residuals, R², and the geometry of projection.
- [Bias, Variance & Overfitting](https://learn.significanthobbies.com/curriculum/concepts/bias-variance-overfitting.html) — Underfitting vs memorizing noise; why in-sample greatness lies.

### Build evidence

- **A/B test analysis report** — Analyze a mock or real experiment: check SRM, compute CI on the lift, interpret p-value and practical significance, and write a ship/no-ship recommendation.
- **Analyze a fake trading signal** — Given (or generate) a spurious 'alpha' signal on synthetic or historical noise, show why it fails: multiple testing, in-sample overfit, or non-stationarity.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 5: Week 5 — Vectors & matrices

Dot products, matmul, transforms — implement multiplication.

### Concepts

- [Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces.html) — Vectors as ordered lists, dot products, norms, orthogonality, and the geometric picture of n-dimensional space.
- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations.html) — Matrix multiplication as composing linear maps: rotation, scaling, projection, and change of basis.
- [Rank, Basis & Subspaces](https://learn.significanthobbies.com/curriculum/concepts/matrix-rank-basis.html) — Column space, rank, independence — why matrices are often low-rank in practice.

### Build evidence

- **Implement matrix multiplication from scratch** — General m×n by n×p matmul with nested loops; apply to a 2D rotation + scale transform on points.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 6: Week 6 — Eigen & regression geometry

Eigenvalues, least squares as projection — OLS from scratch.

### Concepts

- [Eigenvalues & Matrix Decomposition](https://learn.significanthobbies.com/curriculum/concepts/eigenvalues-decomposition.html) — Eigenvectors as directions preserved by a transformation; eigenvalues as stretch factors; SVD as the universal factorization.
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html) — Fitting a line (or hyperplane) by least squares; residuals, R², and the geometry of projection.

### Build evidence

- **Least-squares regression from scratch** — Fit y = Xβ via normal equations (XᵀX)β = Xᵀy using your matmul — no sklearn. Report β, residuals, R².
- **Visualize linear projections** — Draw vector projection onto a line/subspace: show orthogonal residual. Connect to OLS geometry.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 7: Week 7 — PCA

Covariance eigenstructure — PCA without libraries.

### Concepts

- [PCA & Projection](https://learn.significanthobbies.com/curriculum/concepts/pca-projection.html) — Principal components as variance-maximizing orthogonal directions; projection as subspace approximation.
- [Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation.html) — Covariance measures co-movement; correlation normalizes to [−1, 1]. Foundation for regression, PCA, and portfolio risk.

### Build evidence

- **PCA from scratch** — Center data, compute covariance matrix, eigen-decompose, project to 2D. Visualize.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 8: Week 8 — Optimization bridge

Gradients, convexity, MLE — runway to ML training.

### Concepts

- [Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients.html) — Partial derivatives, the gradient vector, and reading a loss surface for descent direction.
- [Multivariable Optimization](https://learn.significanthobbies.com/curriculum/concepts/multivariable-optimization.html) — Convexity, critical points, constrained optimization, and why SGD works on non-convex losses anyway.
- [Maximum Likelihood Estimation](https://learn.significanthobbies.com/curriculum/concepts/maximum-likelihood.html) — Choosing parameters that make the observed data most probable; log-likelihood; connection to cross-entropy loss.

### Build evidence

- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 9: Week 9 — Returns pipeline

Ingest prices, compute daily returns — no look-ahead.

### Concepts

- [Returns & Volatility](https://learn.significanthobbies.com/curriculum/concepts/returns-volatility.html) — Simple/log returns, realized volatility, annualization — basic quant units.

### Build evidence

- **Price data → daily returns pipeline** — Ingest adjusted close prices (CSV or free API), compute simple/log daily returns, handle missing days.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 10: Week 10 — Risk metrics

Volatility, Sharpe, drawdown, correlation matrix.

### Concepts

- [Sharpe, Drawdown & Portfolio Risk](https://learn.significanthobbies.com/curriculum/concepts/portfolio-risk-metrics.html) — Sharpe, max drawdown, correlation matrices — risk-adjusted comparison.
- [Stationarity & Autocorrelation](https://learn.significanthobbies.com/curriculum/concepts/stationarity-autocorrelation.html) — When series statistics are stable; memory in lags; noise vs signal.

### Build evidence

- **Volatility, Sharpe, drawdown, correlation matrix** — On 2–5 tickers: annualized vol, Sharpe (assume rf=0 or document rate), max drawdown, pairwise correlation matrix.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 11: Week 11 — Stochastic intuition

Random walks, Markov, stationarity — noise vs signal.

### Concepts

- [Random Walks & Markov Chains](https://learn.significanthobbies.com/curriculum/concepts/random-walks-markov.html) — Markov property, random walks, transition matrices — generative story behind market efficiency intuition.
- [Bayesian Inference](https://learn.significanthobbies.com/curriculum/concepts/bayesian-inference.html) — Priors, posteriors, credible intervals, and when Bayesian updating beats frequentist tests.

### Build evidence

- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Milestone 12: Week 12 — Backtest discipline

Simple momentum vs SPY/QQQ with honest limitations.

### Concepts

- [Momentum Backtest Discipline](https://learn.significanthobbies.com/curriculum/concepts/momentum-backtest.html) — Momentum rules, SPY/QQQ benchmarks, holdout honesty — why most backtests lie.
- [Information & Entropy](https://learn.significanthobbies.com/curriculum/concepts/information-entropy.html) — Entropy as surprise, cross-entropy as a loss, KL divergence as a distributional distance.

### Build evidence

- **Simple momentum backtest vs SPY/QQQ** — 12-month momentum rule on 1–3 names; compare cumulative return to SPY or QQQ over the same window. State assumptions and survivorship bias.
- **Weekly math writeup (public note)** — Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.
