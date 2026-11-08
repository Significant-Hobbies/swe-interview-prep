# Compute cross-entropy in bits

> True distribution P=(0.5, 0.5); model Q=(0.9, 0.1). Compute H(P) and cross-entropy H(P,Q) in bits (log base 2). Which term dominates?

Canonical: https://learn.significanthobbies.com/curriculum/drills/compute-cross-entropy-bits

True distribution P=(0.5, 0.5); model Q=(0.9, 0.1). Compute H(P) and cross-entropy H(P,Q) in bits (log base 2). Which term dominates?

## The mechanism

Entropy measures average surprise of a distribution. Cross-entropy compares your predicted distribution to the true one — it's the natural classification loss. KL divergence is asymmetric: how many extra nats you pay when you use Q instead of P.

## Expected evidence

H(P)=1 bit. H(P,Q) = −0.5·log₂0.9 − 0.5·log₂0.1 ≈ 0.08 + 1.66 ≈ 1.74 bits. The 1.66 dominates: the model gave 0.1 to a class that occurs half the time, and being confidently wrong is expensive.

## Hints

- H(P)=−Σ p log₂ p.
- Cross-entropy uses Q as the model distribution.

## Sources and practice

- [Information Theory (MacKay)](https://www.inference.org.uk/itprnn/book.html)
- [Study Information & Entropy](https://learn.significanthobbies.com/curriculum/concepts/information-entropy)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/compute-cross-entropy-bits)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
