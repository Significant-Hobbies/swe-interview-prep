# Pack chunks into context budget

> Budget 800 tokens. Chunks A=300,B=400,C=250 relevance [0.9,0.85,0.7]. Greedy pack by relevance until full. Which included?

Canonical: https://learn.significanthobbies.com/curriculum/drills/pack-context-budget

Budget 800 tokens. Chunks A=300,B=400,C=250 relevance [0.9,0.85,0.7]. Greedy pack by relevance until full. Which included?

## The mechanism

Context is a budget. Models attend unevenly (lost-in-the-middle), so order matters: put the strongest evidence at the edges, dedupe, and cut before you overflow.

## Expected evidence

A+B=700; C does not fit entirely — include partial or skip per policy.

## Hints

- Sort by relevance.
- Leave room for instructions.

## Sources and practice

- [Lost in the Middle (Liu et al.)](https://arxiv.org/abs/2307.03172)
- [Study Context Packing](https://learn.significanthobbies.com/curriculum/concepts/context-packing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/pack-context-budget)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
