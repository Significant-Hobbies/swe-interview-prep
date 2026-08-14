# AI Regression Testing

Frozen eval sets, golden cases, rubric versions, stochastic thresholds, canaries, and release gates.

- Difficulty: core
- Tracks: Evaluation & AI Reliability

## Mental model

AI regression tests compare distributions and task outcomes, not exact strings. Freeze representative cases, version graders, repeat stochastic trials, and gate meaningful deltas. Scope: this card owns the CI application — frozen sets, versioned rubrics, repeat trials against stochastic output, and the threshold that blocks a release. How a grader is built lives in `llm-evals`; what to measure beyond quality lives in `quality-cost-latency-measurement`.



## Primary sources

- [LLM Evals: Everything You Need to Know (Hamel Husain)](https://hamel.dev/blog/posts/evals-faq/) (doc)
- [Demystifying Evals for AI Agents (Anthropic)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (doc)
- [Evaluating the Effectiveness of LLM-Evaluators (Eugene Yan)](https://eugeneyan.com/writing/llm-evaluators/) (doc)
- [A Survey on LLM-as-a-Judge](https://arxiv.org/abs/2411.15594) (paper)
- [Using LLM-as-a-Judge For Evaluation: A Complete Guide (Hamel Husain)](https://hamel.dev/blog/posts/llm-judge/) (article)
- [OpenAI Evals Documentation](https://platform.openai.com/docs/guides/evals) (doc)

## Practice

### Design exercise: AI Regression Testing

Frozen eval sets, golden cases, rubric versions, stochastic thresholds, canaries, and release gates. Implement designOutline() returning non-empty values for: evalSet, graderVersion, releaseThreshold. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with evalSet, graderVersion, releaseThreshold plus an explicit failure mode or trade-off.

## Review prompts

- How do you set a release gate on a stochastic system without either blocking every release or catching nothing?

## Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning)

## Related concepts

- [Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning)
- [Hallucination & Failure Detection](https://learn.significanthobbies.com/curriculum/concepts/hallucination-failure-detection)

## Learning paths

- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
