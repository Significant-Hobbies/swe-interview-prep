# Model Evaluation

Held-out loss, baselines, hallucination, leakage.

- Difficulty: core
- Tracks: Evaluation & AI Reliability, AI Systems

## Mental model

Offline eval (on a held-out test set) tells you the model got better. Online eval (A/B test on real users) tells you the product got better. You need both — neither alone is enough. Scope: this card owns the offline/online split and the classical failure modes — held-out sets, baselines, leakage, distribution shift. Building a grader for free-text output is `llm-evals`; comparing whole systems on cost and latency is `quality-cost-latency-measurement`.



## Primary sources

- [Stanford CS336 — L12 Evaluation (Spring 2025)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_12.json) (course)
- [Eugene Yan — Evaluation & Hallucination](https://eugeneyan.com/writing/evals/) (doc)
- [Your AI product needs evals (Hamel Husain)](https://hamel.dev/blog/posts/evals/) (doc)

## Practice

### Perplexity vs classification accuracy

LM benchmark: PPX dropped 5% but exact-match QA accuracy flat. What does that imply about the eval?

**Expected evidence:** LM loss improved token distribution but task metric insensitive or needs few-shot/prompt — check task-specific eval.

## Review prompts

- Held-out loss improved but the A/B test was flat. Name two explanations that are not "the metric is wrong".

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora)
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling)

## Related concepts

- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
