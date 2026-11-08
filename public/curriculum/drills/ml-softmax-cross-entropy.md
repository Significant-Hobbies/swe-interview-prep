# Softmax and cross-entropy loss

> Logits [2,1,0.1], true class index 0. Compute softmax probabilities and −log p(true).

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-softmax-cross-entropy

Logits [2,1,0.1], true class index 0. Compute softmax probabilities and −log p(true).

## The mechanism

Softmax turns raw scores (logits) into probabilities that sum to 1. Cross-entropy then measures how wrong those probabilities are versus the true answer. Together they give a clean gradient that backprop can work with.

## Expected evidence

p≈[0.659,0.242,0.099], loss≈0.417.

## Hints

- Subtract max logit before exp for stability.
- Loss = −log p(correct).

## Sources and practice

- [CS231n — Linear Classification: SVM vs Softmax, cross-entropy loss](https://cs231n.github.io/linear-classify/)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [Softmax function (Wikipedia)](https://en.wikipedia.org/wiki/Softmax_function)
- [Cross entropy (Wikipedia)](https://en.wikipedia.org/wiki/Cross_entropy)
- [Study Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-softmax-cross-entropy)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
