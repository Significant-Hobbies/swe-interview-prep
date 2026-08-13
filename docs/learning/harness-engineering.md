---
title: Harness engineering
audited: 2026-08-13
---

# Harness engineering

A capable model is only one component of a reliable coding agent. The harness is everything that turns intent into bounded, inspectable work: instructions, repository context, tools, environment setup, durable state, feedback, permissions, verification, and termination.

The governing question is not “how do I prompt it harder?” It is:

> Which missing capability, constraint, or feedback signal prevented reliable progress—and how can the environment make that requirement legible and enforceable next time?

## The system

Think of a coding-agent harness as five cooperating subsystems:

1. **Specification** — task intent, acceptance criteria, repository instructions, ownership, and scope.
2. **Environment** — reproducible bootstrap, isolated workspaces, tools, capabilities, and readiness checks.
3. **State** — plan, progress, evidence, blockers, decisions, and the next safe action across sessions.
4. **Feedback** — tests, logs, traces, screenshots, runtime behavior, and independent review.
5. **Control** — budgets, leases, retries, escalation, cancellation, completion evidence, and evaluation.

The Learn roadmap named **Harness Engineering** expands those subsystems into atomic concepts while reusing the existing Repository Intelligence, Coding Agent Systems, Durable Agent Execution, Agent Observability, Permissions & Sandboxing, and AI Regression Testing material.

## Seven builds

Complete these in order inside the existing Playground:

1. **Prompt-only versus rules-first** — replace implicit expectations with scoped repository instructions and executable checks.
2. **Agent-readable workspace** — make structure, bootstrap, readiness, and capabilities discoverable from a fresh worktree.
3. **Multi-session continuity** — persist the goal, progress, evidence, blockers, and one next action through a forced context reset.
4. **Runtime feedback and scope control** — use observations to continue, complete, replan, or escalate without crossing authority boundaries.
5. **Independent self-verification** — separate a maker from a checker that reconstructs the contract and gathers fresh evidence.
6. **Complete harness lifecycle** — connect initialization, bounded work, checking, recovery, cancellation, escalation, and terminal states.
7. **Automated maker-checker loop** — evaluate the complete loop against a baseline, including success, unsafe actions, cost, time, retries, and human interventions.

The final build is not “run an agent for a long time.” It is a finite workflow with durable state and semantic stop conditions. A timer is a budget, not proof that the goal was achieved.

## What mastery means

You should be able to inspect a failed run and distinguish model failure from harness failure. You should also be able to prove which harness component mattered through a controlled ablation instead of changing prompts, tools, model, evaluator, and retry policy together.

Knowing the concepts is the Blitz layer. Designing the contracts and defending trade-offs is the Tradeoff layer. Building and measuring the seven projects is the Practice layer.

## Primary sources

- [OpenAI — Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [OpenAI — Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic — Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [GitHub Docs — Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide)

