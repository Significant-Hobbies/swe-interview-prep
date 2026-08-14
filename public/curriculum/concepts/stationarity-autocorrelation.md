# Stationarity & Autocorrelation

When series statistics are stable; memory in lags; noise vs signal.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

Stationarity: distribution doesn't drift. Autocorrelation: how today relates to yesterday. Random-walk returns have ~0 autocorr; momentum must prove structure exists.

## Where it matters

ARIMA intuition, pairs trading skepticism.

## Common mistakes

- Tests on non-stationary levels
- Trend mistaken for momentum
- Ignoring regime shifts

## Primary sources

- [StatQuest — Stationarity](https://www.youtube.com/watch?v=1Lh1HlLKV4g) (video)
- [Forecasting: Principles and Practice, 3rd ed. (Hyndman & Athanasopoulos)](https://otexts.com/fpp3/) (doc)
- [FPP3 — 9.1 Stationarity and differencing](https://otexts.com/fpp3/stationarity.html) (doc)
- [FPP3 — Ch. 4: Time series features](https://otexts.com/fpp3/features.html) (doc)

## Practice

### Interpret an ACF plot

Daily returns show ACF lag-1 ≈ 0.02, all within confidence band. Prices show ACF lag-1 ≈ 0.98. Interpret each — which series is closer to a random walk in returns?

**Expected evidence:** Return ACF ≈0 → little linear memory (efficient-market-ish). Price ACF high → non-stationary levels; difference of prices (returns) matters.

## Review prompts

- Why does stationarity matter for inference?


## Prerequisites

- [Returns & Volatility](https://learn.significanthobbies.com/curriculum/concepts/returns-volatility)
- [Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation)

## Related concepts

- [Random Walks & Markov Chains](https://learn.significanthobbies.com/curriculum/concepts/random-walks-markov)
- [Momentum Backtest Discipline](https://learn.significanthobbies.com/curriculum/concepts/momentum-backtest)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
