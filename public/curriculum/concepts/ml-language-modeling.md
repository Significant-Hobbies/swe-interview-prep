# Language Modeling

Next-token prediction, context windows, perplexity.

- Difficulty: core
- Tracks: AI Systems

## Mental model

A language model does one thing: predict the next token given the ones before it. Chat, code, reasoning — all of it is built on top of this single objective.



## Primary sources

- [Alisa's Book of LLMs (Alisa Wuffles)](https://alisawuffles.notion.site/alisa-s-book-of-llms) (course)
- [Stanford CS336 — Language Modeling from Scratch (course)](https://cs336.stanford.edu/spring2025/) (course)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html) (course)
- [The Illustrated GPT-2 — language modeling objective](https://jalammar.github.io/illustrated-gpt2/) (article)
- [Let's build GPT from scratch (Karpathy)](https://www.youtube.com/watch?v=kCc8FmEb1nY) (video)

## Practice

### Perplexity from average NLL

Average negative log-likelihood per token = 2.3 nats. Compute perplexity = exp(NLL).

**Expected evidence:** PPX ≈ e^2.3 ≈ 9.97.

## Review prompts

- What does perplexity actually measure, and why can two models' perplexities be incomparable?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization)
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent)

## Related concepts

- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
