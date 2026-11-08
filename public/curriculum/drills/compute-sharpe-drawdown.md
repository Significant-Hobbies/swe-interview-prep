# Sharpe ratio and max drawdown

> Given 252 daily returns with mean 0.04%/day and σ=1%/day (rf=0), compute annualized Sharpe. Equity curve peaks at 1.20 then troughs at 0.95 — max drawdown?

Canonical: https://learn.significanthobbies.com/curriculum/drills/compute-sharpe-drawdown

Given 252 daily returns with mean 0.04%/day and σ=1%/day (rf=0), compute annualized Sharpe. Equity curve peaks at 1.20 then troughs at 0.95 — max drawdown?

## The mechanism

Sharpe = excess return per unit vol. Drawdown = peak-to-trough pain. Correlation matrix shows diversification.

## Expected evidence

Sharpe ≈ (0.0004×252)/(0.01×√252) ≈ 0.63. Max DD = (0.95−1.20)/1.20 ≈ −20.8%.

## Hints

- Annualize mean×252, vol×√252.
- Drawdown from running peak.

## Sources and practice

- [Bailey & López de Prado — Deflated Sharpe](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551)
- [Study Sharpe, Drawdown & Portfolio Risk](https://learn.significanthobbies.com/curriculum/concepts/portfolio-risk-metrics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/compute-sharpe-drawdown)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
