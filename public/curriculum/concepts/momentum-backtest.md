# Momentum Backtest Discipline

Momentum rules, SPY/QQQ benchmarks, holdout honesty — why most backtests lie.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

Backtest = hypothesis on history. Pre-register rule, holdout/walk-forward, benchmark, document costs. In-sample-only edge is curve-fit.

## Where it matters

Quant research prototyping, BS detection.

## Common mistakes

- Optimizing lookback on full history
- Survivorship bias
- No benchmark

## Primary sources

- [QuantConnect — Backtesting overview](https://www.quantconnect.com/docs/v2/writing-algorithms/algorithm-framework/overview) (doc)

## Practice

### Design an honest momentum backtest

Outline a 12-month momentum rule on 3 ETFs: train/holdout split, benchmark (SPY), transaction cost assumption, metrics (CAGR, Sharpe, max DD), and three ways your backtest could lie to you.

**Expected evidence:** Written protocol before code; explicit holdout; limitations section mandatory.

## Review prompts

- Why do most backtests overfit?

## Build evidence

- **Simple momentum backtest vs SPY/QQQ** — 12-month momentum rule on 1–3 names; compare cumulative return to SPY or QQQ over the same window. State assumptions and survivorship bias.

## Prerequisites

- [Sharpe, Drawdown & Portfolio Risk](https://learn.significanthobbies.com/curriculum/concepts/portfolio-risk-metrics)
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing)
- [Bias, Variance & Overfitting](https://learn.significanthobbies.com/curriculum/concepts/bias-variance-overfitting)

## Related concepts

- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering)
- [Stationarity & Autocorrelation](https://learn.significanthobbies.com/curriculum/concepts/stationarity-autocorrelation)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
