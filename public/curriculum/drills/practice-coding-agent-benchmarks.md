# Design exercise: Coding-agent Benchmarks

> Issue resolution tasks, repository setup, patch grading, test-based scoring, contamination, and benchmark validity. Implement designOutline() returning non-empty values for: taskDistribution, environment, verifier. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-coding-agent-benchmarks

Issue resolution tasks, repository setup, patch grading, test-based scoring, contamination, and benchmark validity. Implement designOutline() returning non-empty values for: taskDistribution, environment, verifier. Each value must name a concrete mechanism or decision.

## The mechanism

A coding benchmark is an environment plus task distribution and verifier. Scores are useful only when setup, contamination, flaky tests, and patch validity are controlled. Scope: this card owns one benchmark family and its validity — repository setup, patch grading, flaky tests, and contamination. The general practice of grading agent actions is `tool-use-evaluations`; grading text output is `llm-evals`.

## Expected evidence

A design outline with taskDistribution, environment, verifier plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Evaluating Large Language Models Trained on Code (HumanEval / Codex)](https://arxiv.org/abs/2107.03374)
- [LiveCodeBench: Holistic and Contamination Free Evaluation of LLMs for Code](https://arxiv.org/abs/2403.07974)
- [The SWE-Bench Illusion: When State-of-the-Art LLMs Remember Instead of Reason](https://arxiv.org/abs/2506.12286)
- [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770)
- [SWE-bench](https://www.swebench.com/)
- [Study Coding-agent Benchmarks](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-benchmarks)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-coding-agent-benchmarks)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
