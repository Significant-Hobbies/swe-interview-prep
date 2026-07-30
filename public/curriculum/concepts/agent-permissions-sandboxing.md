# Agent Permissions & Sandboxing

Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

Treat an agent as an untrusted principal. Grant the smallest capability for the shortest time, isolate execution, require approval for irreversible effects, and log authority use. Scope: this card owns treating an agent as an untrusted principal — capability grants, approval gates for irreversible effects, secret isolation and audit. The underlying isolation technology is `sandbox-execution-environments`; the threat-modelling discipline is `security-isolation-boundaries`.



## Primary sources

- [How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude) (doc)
- [Defeating Prompt Injections by Design (CaMeL)](https://arxiv.org/abs/2503.18813) (paper)
- [Making Claude Code More Secure and Autonomous with Sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing) (article)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) (doc)

## Practice

### Design exercise: Agent Permissions & Sandboxing

Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs. Implement designOutline() returning non-empty values for: capabilityScope, approvalGate, auditTrail. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with capabilityScope, approvalGate, auditTrail plus an explicit failure mode or trade-off.

## Review prompts

- Why is an agent treated as an untrusted principal even when the user is trusted?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution.html)

## Related concepts

- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution.html)
- [Long-running & Scheduled Agents](https://learn.significanthobbies.com/curriculum/concepts/long-running-scheduled-agents.html)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w.html)
