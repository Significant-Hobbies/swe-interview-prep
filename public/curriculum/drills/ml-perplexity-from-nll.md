# Perplexity from average NLL

> Average negative log-likelihood per token = 2.3 nats. Compute perplexity = exp(NLL).

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-perplexity-from-nll

Average negative log-likelihood per token = 2.3 nats. Compute perplexity = exp(NLL).

## The mechanism

A language model does one thing: predict the next token given the ones before it. Chat, code, reasoning — all of it is built on top of this single objective.

## Expected evidence

PPX ≈ e^2.3 ≈ 9.97.

## Hints

- Perplexity is exp of average NLL.
- Lower is better.

## Sources and practice

- [Alisa's Book of LLMs (Alisa Wuffles)](https://alisawuffles.notion.site/alisa-s-book-of-llms)
- [Stanford CS336 — Language Modeling from Scratch (course)](https://cs336.stanford.edu/spring2025/)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [The Illustrated GPT-2 — language modeling objective](https://jalammar.github.io/illustrated-gpt2/)
- [Let's build GPT from scratch (Karpathy)](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- [Study Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-perplexity-from-nll)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
