# LLM Evals

Measuring LLM output quality with datasets, graders, and LLM-as-judge.

- Difficulty: core
- Tracks: Evaluation & AI Reliability, AI Systems

## Mental model

Evals are unit tests for non-deterministic systems. Fix a dataset of inputs with expected behavior, define a grader (exact match, rubric, or LLM-as-judge), and run it on every prompt/model change. Scope: this card owns constructing the grader — dataset design, rubric writing, and LLM-as-judge including its calibration and bias checks. Running those graders as a release gate is `ai-regression-testing`; grading an agent's actions rather than its text is `tool-use-evaluations`.

## Where it matters

Every serious LLM product; regression gates in CI.

## Common mistakes

- Shipping prompt changes on vibes with no eval
- LLM-as-judge without checking the judge against humans
- Eval set that does not cover real failure modes

## Primary sources

- [Your AI product needs evals (Hamel Husain)](https://hamel.dev/blog/posts/evals/) (article)
- [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685) (paper)
- [HELM — Holistic Evaluation of Language Models (Stanford CRFM)](https://crfm.stanford.edu/helm/) (doc)
- [EleutherAI — lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) (doc)
- [Using LLM-as-a-Judge For Evaluation: A Complete Guide (Hamel Husain)](https://hamel.dev/blog/posts/llm-judge/) (article)

## Practice

### Build an LLM eval

Create a dataset of inputs with expected behavior and a grader (deterministic or LLM-as-judge). Run it as one command and score a prompt.

**Expected evidence:** A pass-rate score that changes when you change the prompt.

## Review prompts

- Why must an LLM-as-judge be validated against human labels?

## Build evidence

- **LLM eval harness** — A dataset + grader harness that scores LLM output on every prompt/model change.
- **Model router** — Route each request to the cheapest model that passes evals for that request class.
- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs)

## Related concepts

- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals)
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing)
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation)
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing)
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering)
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
