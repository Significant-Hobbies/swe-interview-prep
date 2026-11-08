# Interpret an ACF plot

> Daily returns show ACF lag-1 ≈ 0.02, all within confidence band. Prices show ACF lag-1 ≈ 0.98. Interpret each — which series is closer to a random walk in returns?

Canonical: https://learn.significanthobbies.com/curriculum/drills/interpret-autocorrelation-plot

Daily returns show ACF lag-1 ≈ 0.02, all within confidence band. Prices show ACF lag-1 ≈ 0.98. Interpret each — which series is closer to a random walk in returns?

## The mechanism

Stationarity: distribution doesn't drift. Autocorrelation: how today relates to yesterday. Random-walk returns have ~0 autocorr; momentum must prove structure exists.

## Expected evidence

Return ACF ≈0 → little linear memory (efficient-market-ish). Price ACF high → non-stationary levels; difference of prices (returns) matters.

## Hints

- ACF on levels confounds trend with memory.
- Returns stationarity is the usual assumption.

## Sources and practice

- [StatQuest — Stationarity](https://www.youtube.com/watch?v=1Lh1HlLKV4g)
- [Forecasting: Principles and Practice, 3rd ed. (Hyndman & Athanasopoulos)](https://otexts.com/fpp3/)
- [FPP3 — 9.1 Stationarity and differencing](https://otexts.com/fpp3/stationarity.html)
- [FPP3 — Ch. 4: Time series features](https://otexts.com/fpp3/features.html)
- [Study Stationarity & Autocorrelation](https://learn.significanthobbies.com/curriculum/concepts/stationarity-autocorrelation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/interpret-autocorrelation-plot)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
