# 12-Week Evaluation & AI Reliability

Build an evidence-backed evaluation and observability system for models, tools, and agents. Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.

- Horizon: 90d
- Outcome: Build an evidence-backed evaluation and observability system for models, tools, and agents.
- Tracks: Evaluation & AI Reliability

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Weeks 1-4 — Foundations and mechanisms

Build the domain vocabulary and explain the core mechanisms from first principles.

### Concepts

- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs) — Forcing LLM output into a validated JSON schema.
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math) — Vectors, matrices, dot products, matmul, shapes.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent) — Loss surfaces, learning rate, SGD steps.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop) — Chain rule, autograd, forward/backward passes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent) — Logits to probabilities, negative log-likelihood loss.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw) — Moments, weight decay, gradient clipping.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization) — Byte-level, char-level, BPE, vocab design.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling) — Next-token prediction, context windows, perplexity.
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling) — Temperature, top-k, greedy decoding.
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings) — Token & position embeddings, tied weights.
- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention) — Q/K/V, scaled dot-product, causal masking.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head) — Parallel heads, head_dim split, output projection.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block) — Pre-LayerNorm, residuals, MLP, GELU.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training) — Init, NaNs, overfit tests, gradient checks.
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora) — Frozen base, low-rank adapters, rank/alpha.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals) — Measuring LLM output quality with datasets, graders, and LLM-as-judge.
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation) — Held-out loss, baselines, hallucination, leakage.
- [Coding-agent Benchmarks](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-benchmarks) — Issue resolution tasks, repository setup, patch grading, test-based scoring, contamination, and benchmark validity.
- [Tool-use Evaluations](https://learn.significanthobbies.com/curriculum/concepts/tool-use-evaluations) — Tool selection, argument correctness, sequencing, recovery, side-effect safety, and end-state verification.



## Milestone 2: Weeks 5-8 — Production systems and trade-offs

Design the production path, including resource, scale, safety, and operability trade-offs.

### Concepts

- [Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning) — Treating prompts as versioned artifacts with logged inputs/outputs.
- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing) — Frozen eval sets, golden cases, rubric versions, stochastic thresholds, canaries, and release gates.
- [Hallucination & Failure Detection](https://learn.significanthobbies.com/curriculum/concepts/hallucination-failure-detection) — Unsupported claims, citations, abstention, tool errors, constraint violations, uncertainty, and escalation.
- [Quality, Cost & Latency Measurement](https://learn.significanthobbies.com/curriculum/concepts/quality-cost-latency-measurement) — Task success, calibrated quality, token and tool cost, latency distributions, reliability, and Pareto frontiers.



## Milestone 3: Weeks 9-12 — Reliability, verification, and synthesis

Test failure modes, measure outcomes, and ship the synthesis artifact.

### Concepts

- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability) — Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics.
- [Tracing & Replay](https://learn.significanthobbies.com/curriculum/concepts/tracing-replay) — Deterministic inputs, event logs, snapshots, prompt/model versions, tool fixtures, and counterfactual re-execution.
- [Evidence-backed Verification](https://learn.significanthobbies.com/curriculum/concepts/evidence-backed-verification) — Claims, source provenance, executable checks, screenshots, diffs, test outputs, and acceptance criteria.
- [Human Review Systems](https://learn.significanthobbies.com/curriculum/concepts/human-review-systems) — Review queues, risk routing, disagreement, calibration, escalation, auditability, and learning from corrections.

### Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.
