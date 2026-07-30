# Sampling & Decoding

Temperature, top-k, greedy decoding.

- Difficulty: core
- Tracks: AI Systems

## Mental model

After the model outputs a probability for each next token, you have to pick one. Greedy picks the top — safe but dull. Temperature, top-k, and top-p (nucleus) introduce controlled randomness. Pick by how much variety the task can tolerate.



## Primary sources

- [Stanford CS336 — L10 Inference (Spring 2025)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_10.json) (course)
- [The Curious Case of Neural Text Degeneration (Holtzman et al.)](https://arxiv.org/abs/1904.09751) (paper)
- [The Illustrated GPT-2 — output sampling](https://jalammar.github.io/illustrated-gpt2/) (article)
- [HuggingFace — Generation strategies](https://huggingface.co/docs/transformers/en/generation_strategies) (doc)

## Practice

### Temperature scaling logits

Logits [2,1,0]. Apply temperature T=2 and T=0.5 before softmax. Which T makes the distribution sharper?

**Expected evidence:** T 1 flattens.

## Review prompts

- Top-k and top-p both truncate the distribution. When does the difference matter?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling.html)

## Related concepts

- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation.html)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
