# Design exercise: Agent Permissions & Sandboxing

> Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs. Implement designOutline() returning non-empty values for: capabilityScope, approvalGate, auditTrail. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-agent-permissions-sandboxing

Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs. Implement designOutline() returning non-empty values for: capabilityScope, approvalGate, auditTrail. Each value must name a concrete mechanism or decision.

## The mechanism

Treat an agent as an untrusted principal. Grant the smallest capability for the shortest time, isolate execution, require approval for irreversible effects, and log authority use. Scope: this card owns treating an agent as an untrusted principal — capability grants, approval gates for irreversible effects, secret isolation and audit. The underlying isolation technology is `sandbox-execution-environments`; the threat-modelling discipline is `security-isolation-boundaries`.

## Expected evidence

A design outline with capabilityScope, approvalGate, auditTrail plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude)
- [Defeating Prompt Injections by Design (CaMeL)](https://arxiv.org/abs/2503.18813)
- [Making Claude Code More Secure and Autonomous with Sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Study Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-agent-permissions-sandboxing)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
