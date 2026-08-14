# Returns & Volatility

Simple/log returns, realized volatility, annualization — basic quant units.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Prices drift; returns are closer to stable. Vol is return std dev, usually annualized √252. Correlate returns, not prices.

## Where it matters

Risk, options intuition, strategy evaluation.

## Common mistakes

- Regressing price levels
- Wrong annualization factor
- Look-ahead in return alignment

## Primary sources

- [Python for Finance (Hilpisch)](https://github.com/yhilpisch/py4fi2nd) (doc)
- [Forecasting: Principles and Practice, 3rd ed. (Hyndman & Athanasopoulos)](https://otexts.com/fpp3/) (doc)

## Practice

### Log returns and annualized volatility

From 5 consecutive adjusted closes, compute log returns r_t = ln(P_t/P_{t-1}). Estimate daily σ and annualize with √252. Show one line of code or formula per step.

**Expected evidence:** 4 log returns; σ_daily; σ_annual = σ_daily×√252.

## Review prompts

- Why model returns instead of prices?

## Build evidence

- **Price data → daily returns pipeline** — Ingest adjusted close prices (CSV or free API), compute simple/log daily returns, handle missing days.
- **Volatility, Sharpe, drawdown, correlation matrix** — On 2–5 tickers: annualized vol, Sharpe (assume rf=0 or document rate), max drawdown, pairwise correlation matrix.

## Prerequisites

- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables)
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics)
- [Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt)

## Related concepts

- [Sharpe, Drawdown & Portfolio Risk](https://learn.significanthobbies.com/curriculum/concepts/portfolio-risk-metrics)
- [Stationarity & Autocorrelation](https://learn.significanthobbies.com/curriculum/concepts/stationarity-autocorrelation)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
