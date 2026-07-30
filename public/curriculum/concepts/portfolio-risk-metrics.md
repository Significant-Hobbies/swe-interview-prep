# Sharpe, Drawdown & Portfolio Risk

Sharpe, max drawdown, correlation matrices — risk-adjusted comparison.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Sharpe = excess return per unit vol. Drawdown = peak-to-trough pain. Correlation matrix shows diversification.

## Where it matters

Strategy gates, portfolio dashboards.

## Common mistakes

- Sharpe on tiny samples
- Ignoring costs
- Different leverage comparisons

## Primary sources

- [Bailey & López de Prado — Deflated Sharpe](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551) (paper)

## Practice

### Sharpe ratio and max drawdown

Given 252 daily returns with mean 0.04%/day and σ=1%/day (rf=0), compute annualized Sharpe. Equity curve peaks at 1.20 then troughs at 0.95 — max drawdown?

**Expected evidence:** Sharpe ≈ (0.0004×252)/(0.01×√252) ≈ 0.63. Max DD = (0.95−1.20)/1.20 ≈ −20.8%.

## Review prompts

- What are limitations of the Sharpe ratio?

## Build evidence

- **Volatility, Sharpe, drawdown, correlation matrix** — On 2–5 tickers: annualized vol, Sharpe (assume rf=0 or document rate), max drawdown, pairwise correlation matrix.
- **Simple momentum backtest vs SPY/QQQ** — 12-month momentum rule on 1–3 names; compare cumulative return to SPY or QQQ over the same window. State assumptions and survivorship bias.

## Prerequisites

- [Returns & Volatility](https://learn.significanthobbies.com/curriculum/concepts/returns-volatility.html)
- [Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation.html)

## Related concepts

- [Momentum Backtest Discipline](https://learn.significanthobbies.com/curriculum/concepts/momentum-backtest.html)
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering.html)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
