# Normal tail probability

> Latency is Normal(μ=100ms, σ=20ms). Approximate P(X > 140ms) using the z-score and a standard normal table (Φ(2) ≈ 0.977). What fraction is within 1σ of the mean?

Canonical: https://learn.significanthobbies.com/curriculum/drills/normal-tail-probability

Latency is Normal(μ=100ms, σ=20ms). Approximate P(X > 140ms) using the z-score and a standard normal table (Φ(2) ≈ 0.977). What fraction is within 1σ of the mean?

## The mechanism

A random variable is a function from outcomes to numbers. Expectation is the long-run average; variance measures spread. The CLT says sums of many independent pieces look Gaussian — which is why normal distributions are everywhere.

## Expected evidence

z=(140−100)/20=2; P(X>140)≈1−0.977=0.023. Within 1σ: ≈68%.

## Hints

- z = (x−μ)/σ.
- Tail probability is 1−Φ(z) for upper tail.

## Sources and practice

- [MIT 6.041SC — Probabilistic Systems Analysis (course)](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/)
- [StatQuest — Probability vs Likelihood](https://www.youtube.com/watch?v=pYx9wEc34tY)
- [Study Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/normal-tail-probability)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
