# Simulate a two-state Markov chain

> Transition matrix P=[[0.9,0.1],[0.2,0.8]] on states {0,1}. Simulate 1000 steps from state 0. Estimate stationary proportion of time in state 1.

Canonical: https://learn.significanthobbies.com/curriculum/drills/simulate-markov-chain

Transition matrix P=[[0.9,0.1],[0.2,0.8]] on states {0,1}. Simulate 1000 steps from state 0. Estimate stationary proportion of time in state 1.

## The mechanism

Markov: future depends only on present state. Random walk sums independent steps. If returns are unpredictable, momentum must demonstrate structure, not narrative.

## Expected evidence

≈1/3 time in state 1 (solve πP=π → π=(2/3,1/3)). Simulation should be close.

## Hints

- Each step: sample next state from P[current].
- Stationary π solves πP=π.

## Sources and practice

- [MIT 6.041SC — Probabilistic Systems Analysis (course)](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/)
- [Grinstead & Snell, Introduction to Probability — Ch. 11: Markov Chains](https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter11.pdf)
- [Grinstead & Snell — Ch. 12: Random Walks](https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter12.pdf)
- [MIT 6.041 L16 — Markov Chains I (Tsitsiklis)](https://ocw.mit.edu/courses/6-041-probabilistic-systems-analysis-and-applied-probability-fall-2010/resources/lecture-16-markov-chains-i/)
- [Markov Chains explained visually (Setosa)](https://setosa.io/ev/markov-chains/)
- [Study Random Walks & Markov Chains](https://learn.significanthobbies.com/curriculum/concepts/random-walks-markov)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/simulate-markov-chain)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
