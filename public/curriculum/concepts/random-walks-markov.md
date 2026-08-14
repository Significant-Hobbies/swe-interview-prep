# Random Walks & Markov Chains

Markov property, random walks, transition matrices — generative story behind market efficiency intuition.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Markov: future depends only on present state. Random walk sums independent steps. If returns are unpredictable, momentum must demonstrate structure, not narrative.

## Where it matters

PageRank, HMMs, backtest skepticism.

## Common mistakes

- Markov when volatility clusters
- Trending levels called random walk
- Confusing level walk with return predictability

## Primary sources

- [MIT 6.041SC — Probabilistic Systems Analysis (course)](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/) (course)
- [Grinstead & Snell, Introduction to Probability — Ch. 11: Markov Chains](https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter11.pdf) (doc)
- [Grinstead & Snell — Ch. 12: Random Walks](https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter12.pdf) (doc)
- [MIT 6.041 L16 — Markov Chains I (Tsitsiklis)](https://ocw.mit.edu/courses/6-041-probabilistic-systems-analysis-and-applied-probability-fall-2010/resources/lecture-16-markov-chains-i/) (video)
- [Markov Chains explained visually (Setosa)](https://setosa.io/ev/markov-chains/) (article)

## Practice

### Simulate a two-state Markov chain

Transition matrix P=[[0.9,0.1],[0.2,0.8]] on states {0,1}. Simulate 1000 steps from state 0. Estimate stationary proportion of time in state 1.

**Expected evidence:** ≈1/3 time in state 1 (solve πP=π → π=(2/3,1/3)). Simulation should be close.

## Review prompts

- What is the Markov property?

## Build evidence

- **Simulate coin flips, dice, and random walks** — Code simulators (no stats libraries): Bernoulli trials, dice sums, and a 1D random walk. Plot or print distributions and compare sample mean to theory.

## Prerequisites

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals)
- [Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions)

## Related concepts

- [Returns & Volatility](https://learn.significanthobbies.com/curriculum/concepts/returns-volatility)
- [Stationarity & Autocorrelation](https://learn.significanthobbies.com/curriculum/concepts/stationarity-autocorrelation)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
