# Harness Evaluation

Task suites, outcome rubrics, trajectory metrics, cost and latency budgets, ablations, and regression gates for the harness rather than the model alone.

- Difficulty: advanced
- Tracks: Agent Systems, Evaluation & AI Reliability

## Mental model

A harness is a policy that transforms a model and environment into task outcomes. Evaluate the whole policy on frozen tasks, record success, regressions, cost, time, interventions, and unsafe actions, then ablate one harness component at a time to learn which constraints actually carry performance.

## Where it matters

Coding-agent benchmarks, release gates, tool-policy experiments, prompt and instruction changes, cost controls, and harness simplification.

## Common mistakes

- Measuring only final pass rate and ignoring cost, retries, intervention, or unsafe actions
- Changing model, tools, prompts, and evaluator together so no causal conclusion is possible
- Using the same model-generated rubric and answer as both system output and ground truth

## Primary sources

- [Anthropic — Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) (article)
- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/) (article)

## Practice

### Evaluate and ablate an agent harness

Implement compareHarness(baseline, candidate, limits). Each run has tasksPassed, tasksTotal, costUsd, minutes, interventions, and unsafeActions. Return successRateDelta, costDelta, timeDelta, and release. release is true only when candidate success rate does not regress, unsafeActions is zero, costUsd and minutes are within limits, and interventions do not exceed baseline.

**Expected evidence:** A multi-objective harness comparison that prevents pass-rate-only releases.

## Review prompts

- A new harness raises task pass rate from 80% to 86% but doubles cost and triples human interventions. How should the team evaluate the change and discover which harness component caused it?

## Build evidence

- **Automate and Evaluate a Maker-Checker Loop** — Automate a bounded loop in which a maker attempts one task, an independent checker evaluates explicit acceptance criteria, failures return actionable evidence, and the orchestrator stops on success, escalation, cancellation, or budget exhaustion. Compare it with a baseline harness on a frozen task suite.

## Prerequisites

- [Independent Agent Verification](https://learn.significanthobbies.com/curriculum/concepts/independent-agent-verification)
- [Agent Run Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/agent-run-lifecycle)

## Related concepts

- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing)
- [Tool-use Evaluations](https://learn.significanthobbies.com/curriculum/concepts/tool-use-evaluations)
- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability)

## Learning paths

- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering)
