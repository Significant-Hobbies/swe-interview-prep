# Tokenization (LLM)

Byte-level, char-level, BPE, vocab design.

- Difficulty: intro
- Tracks: AI Systems

## Mental model

LLM tokenizers (BPE, SentencePiece) split text into small reusable pieces — often subwords — so the model can handle any input even if it has not seen the exact word. The model and the tokenizer are a pair; swapping one breaks the other.



## Primary sources

- [Stanford CS336 — Language Modeling from Scratch (course)](https://cs336.stanford.edu/spring2025/) (course)
- [CS336 Assignment 1 — Build a tokenizer from scratch](https://github.com/stanford-cs336/assignment1-basics/tree/main) (doc)
- [Let's build the GPT Tokenizer (Karpathy)](https://www.youtube.com/watch?v=zduSFxRajkE) (video)
- [The Illustrated GPT-2 — BPE tokenization](https://jalammar.github.io/illustrated-gpt2/) (article)
- [HuggingFace — Tokenizers](https://huggingface.co/docs/tokenizers/main/en/index) (doc)

## Practice

### One BPE merge step

Corpus tokenized as [l,o,w,e,r,l,o,w,e,s,t]. Count adjacent pairs; merge the most frequent pair once. What is the new sequence?

**Expected evidence:** lo appears twice → merge lo → [lo,w,e,r,lo,w,e,s,t].

## Review prompts

- Why can you not swap a model's tokenizer for a better one without retraining?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization.html)
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling.html)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
