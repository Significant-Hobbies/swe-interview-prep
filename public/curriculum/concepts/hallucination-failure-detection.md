# Hallucination & Failure Detection

Unsupported claims, citations, abstention, tool errors, constraint violations, uncertainty, and escalation.

- Difficulty: core
- Tracks: Evaluation & AI Reliability

## Mental model

Detect failures against evidence and task constraints. Require citations where possible, validate structured claims, calibrate abstention, and route uncertainty to tools or humans.



## Primary sources

- [SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative LLMs](https://arxiv.org/abs/2303.08896) (paper)
- [Detecting hallucinations in large language models using semantic entropy (Nature, 2024)](https://www.nature.com/articles/s41586-024-07421-0) (paper)
- [Extrinsic Hallucinations in LLMs (Lilian Weng)](https://lilianweng.github.io/posts/2024-07-07-hallucination/) (article)

## Practice

### Design exercise: Hallucination & Failure Detection

Unsupported claims, citations, abstention, tool errors, constraint violations, uncertainty, and escalation. Implement designOutline() returning non-empty values for: evidenceCheck, constraintCheck, escalation. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with evidenceCheck, constraintCheck, escalation plus an explicit failure mode or trade-off.

## Review prompts

- Name two mechanically different ways to detect a probable hallucination, and what each one misses.

## Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing.html)

## Related concepts

- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing.html)
- [Quality, Cost & Latency Measurement](https://learn.significanthobbies.com/curriculum/concepts/quality-cost-latency-measurement.html)

## Learning paths

- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
