# Build an LLM eval

> Create a dataset of inputs with expected behavior and a grader (deterministic or LLM-as-judge). Run it as one command and score a prompt.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-llm-eval

Create a dataset of inputs with expected behavior and a grader (deterministic or LLM-as-judge). Run it as one command and score a prompt.

## The mechanism

Evals are unit tests for non-deterministic systems. Fix a dataset of inputs with expected behavior, define a grader (exact match, rubric, or LLM-as-judge), and run it on every prompt/model change. Scope: this card owns constructing the grader — dataset design, rubric writing, and LLM-as-judge including its calibration and bias checks. Running those graders as a release gate is `ai-regression-testing`; grading an agent's actions rather than its text is `tool-use-evaluations`.

## Expected evidence

A pass-rate score that changes when you change the prompt.

## Hints

- Cover real failure modes, not just happy paths.
- Validate an LLM judge against human labels.

## Sources and practice

- [Your AI product needs evals (Hamel Husain)](https://hamel.dev/blog/posts/evals/)
- [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685)
- [HELM — Holistic Evaluation of Language Models (Stanford CRFM)](https://crfm.stanford.edu/helm/)
- [EleutherAI — lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- [Using LLM-as-a-Judge For Evaluation: A Complete Guide (Hamel Husain)](https://hamel.dev/blog/posts/llm-judge/)
- [Study LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-llm-eval)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
