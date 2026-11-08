# One BPE merge step

> Corpus tokenized as [l,o,w,e,r,l,o,w,e,s,t]. Count adjacent pairs; merge the most frequent pair once. What is the new sequence?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-bpe-merge-step

Corpus tokenized as [l,o,w,e,r,l,o,w,e,s,t]. Count adjacent pairs; merge the most frequent pair once. What is the new sequence?

## The mechanism

LLM tokenizers (BPE, SentencePiece) split text into small reusable pieces — often subwords — so the model can handle any input even if it has not seen the exact word. The model and the tokenizer are a pair; swapping one breaks the other.

## Expected evidence

lo appears twice → merge lo → [lo,w,e,r,lo,w,e,s,t].

## Hints

- Count bigram frequencies.
- Merge highest-count pair into one token.

## Sources and practice

- [Stanford CS336 — Language Modeling from Scratch (course)](https://cs336.stanford.edu/spring2025/)
- [CS336 Assignment 1 — Build a tokenizer from scratch](https://github.com/stanford-cs336/assignment1-basics/tree/main)
- [Let's build the GPT Tokenizer (Karpathy)](https://www.youtube.com/watch?v=zduSFxRajkE)
- [The Illustrated GPT-2 — BPE tokenization](https://jalammar.github.io/illustrated-gpt2/)
- [HuggingFace — Tokenizers](https://huggingface.co/docs/tokenizers/main/en/index)
- [Study Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-bpe-merge-step)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
