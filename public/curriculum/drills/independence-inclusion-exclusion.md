# Independence and inclusion-exclusion

> P(A)=0.4, P(B)=0.5, P(A∩B)=0.2. Are A and B independent? Compute P(A∪B). If they were mutually exclusive, what would P(A∪B) be instead?

Canonical: https://learn.significanthobbies.com/curriculum/drills/independence-inclusion-exclusion

P(A)=0.4, P(B)=0.5, P(A∩B)=0.2. Are A and B independent? Compute P(A∪B). If they were mutually exclusive, what would P(A∪B) be instead?

## The mechanism

Probability is a bookkeeping system for uncertainty. Conditional probability restricts the sample space; Bayes flips cause and effect — from 'how likely is the evidence given the hypothesis' to 'how likely is the hypothesis given the evidence'.

## Expected evidence

P(A)P(B)=0.2=P(A∩B) → independent. P(A∪B)=0.4+0.5−0.2=0.7. Mutually exclusive would give 0.9 — conflating the two is a common bug.

## Hints

- Independent ⟺ P(A∩B)=P(A)P(B).
- Union: P(A)+P(B)−P(A∩B).

## Sources and practice

- [Khan Academy — Probability](https://www.khanacademy.org/math/statistics-probability/probability-library)
- [MIT 6.041SC — Probabilistic Systems Analysis (course)](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/)
- [Seeing Theory — Basic Probability](https://seeing-theory.brown.edu/basic-probability/index.html)
- [Study Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/independence-inclusion-exclusion)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
