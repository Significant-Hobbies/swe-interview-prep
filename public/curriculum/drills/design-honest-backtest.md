# Design an honest momentum backtest

> Outline a 12-month momentum rule on 3 ETFs: train/holdout split, benchmark (SPY), transaction cost assumption, metrics (CAGR, Sharpe, max DD), and three ways your backtest could lie to you.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-honest-backtest

Outline a 12-month momentum rule on 3 ETFs: train/holdout split, benchmark (SPY), transaction cost assumption, metrics (CAGR, Sharpe, max DD), and three ways your backtest could lie to you.

## The mechanism

Backtest = hypothesis on history. Pre-register rule, holdout/walk-forward, benchmark, document costs. In-sample-only edge is curve-fit.

## Expected evidence

Written protocol before code; explicit holdout; limitations section mandatory.

## Hints

- Pre-register lookback and rebalance frequency.
- Survivorship and snooping are top lies.

## Sources and practice

- [QuantConnect — Backtesting overview](https://www.quantconnect.com/docs/v2/writing-algorithms/algorithm-framework/overview)
- [Study Momentum Backtest Discipline](https://learn.significanthobbies.com/curriculum/concepts/momentum-backtest)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-honest-backtest)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
