# Information & Entropy

Entropy as surprise, cross-entropy as a loss, KL divergence as a distributional distance.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

Entropy measures average surprise of a distribution. Cross-entropy compares your predicted distribution to the true one — it's the natural classification loss. KL divergence is asymmetric: how many extra nats you pay when you use Q instead of P.

## Where it matters

Cross-entropy loss, language model training, variational inference, compression.

## Common mistakes

- Treating KL as a metric (it's not symmetric)
- Using log base inconsistently (bits vs nats)
- Confusing entropy of data with entropy of a model

## Primary sources

- [Information Theory (MacKay)](https://www.inference.org.uk/itprnn/book.html) (doc)

## Practice

### Compute cross-entropy in bits

True distribution P=(0.5, 0.5); model Q=(0.9, 0.1). Compute H(P) and cross-entropy H(P,Q) in bits (log base 2). Which term dominates?

**Expected evidence:** H(P)=1 bit. H(P,Q) = −0.5·log₂0.9 − 0.5·log₂0.1 ≈ 0.08 + 1.66 ≈ 1.74 bits. The 1.66 dominates: the model gave 0.1 to a class that occurs half the time, and being confidently wrong is expensive.

## Review prompts

- Why is cross-entropy a natural classification loss?


## Prerequisites

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals)
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables)

## Related concepts

- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent)
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling)
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
