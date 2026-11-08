# Log returns and annualized volatility

> From 5 consecutive adjusted closes, compute log returns r_t = ln(P_t/P_{t-1}). Estimate daily σ and annualize with √252. Show one line of code or formula per step.

Canonical: https://learn.significanthobbies.com/curriculum/drills/compute-log-returns-vol

From 5 consecutive adjusted closes, compute log returns r_t = ln(P_t/P_{t-1}). Estimate daily σ and annualize with √252. Show one line of code or formula per step.

## The mechanism

Prices drift; returns are closer to stable. Vol is return std dev, usually annualized √252. Correlate returns, not prices.

## Expected evidence

4 log returns; σ_daily; σ_annual = σ_daily×√252.

## Hints

- Align returns to t, not t-1 price.
- Use sample std dev on returns.

## Sources and practice

- [Python for Finance (Hilpisch)](https://github.com/yhilpisch/py4fi2nd)
- [Forecasting: Principles and Practice, 3rd ed. (Hyndman & Athanasopoulos)](https://otexts.com/fpp3/)
- [Study Returns & Volatility](https://learn.significanthobbies.com/curriculum/concepts/returns-volatility)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/compute-log-returns-vol)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
