# Coding-agent Benchmarks

Issue resolution tasks, repository setup, patch grading, test-based scoring, contamination, and benchmark validity.

- Difficulty: core
- Tracks: Evaluation & AI Reliability

## Mental model

A coding benchmark is an environment plus task distribution and verifier. Scores are useful only when setup, contamination, flaky tests, and patch validity are controlled. Scope: this card owns one benchmark family and its validity — repository setup, patch grading, flaky tests, and contamination. The general practice of grading agent actions is `tool-use-evaluations`; grading text output is `llm-evals`.



## Primary sources

- [Evaluating Large Language Models Trained on Code (HumanEval / Codex)](https://arxiv.org/abs/2107.03374) (doc)
- [LiveCodeBench: Holistic and Contamination Free Evaluation of LLMs for Code](https://arxiv.org/abs/2403.07974) (doc)
- [The SWE-Bench Illusion: When State-of-the-Art LLMs Remember Instead of Reason](https://arxiv.org/abs/2506.12286) (doc)
- [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770) (paper)
- [SWE-bench](https://www.swebench.com/) (doc)

## Practice

### Design exercise: Coding-agent Benchmarks

Issue resolution tasks, repository setup, patch grading, test-based scoring, contamination, and benchmark validity. Implement designOutline() returning non-empty values for: taskDistribution, environment, verifier. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with taskDistribution, environment, verifier plus an explicit failure mode or trade-off.

## Review prompts

- A model scores well on a public coding benchmark. Name the two threats to that score's validity.

## Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation)

## Related concepts

- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation)
- [Tool-use Evaluations](https://learn.significanthobbies.com/curriculum/concepts/tool-use-evaluations)

## Learning paths

- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
