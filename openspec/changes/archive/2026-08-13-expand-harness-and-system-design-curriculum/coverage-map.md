# Harness Engineering coverage map

The external Harness Engineering course is used as a coverage checklist. The product keeps its own atomic taxonomy and stable mastery IDs.

| Required capability | Canonical concept |
| --- | --- |
| Harness architecture and tool loop | `coding-agent-systems` |
| Agent-readable repository structure and search | `repository-intelligence` |
| Repository instruction precedence and locality | `repository-instruction-topology` |
| Reproducible environment bootstrap and readiness checks | `agent-environment-contracts` |
| Multi-session checkpoints and handoffs | `agent-work-state-handoffs` |
| Bounded task decomposition and scope control | `agent-scope-control` |
| Durable execution, retries, and crash recovery | `durable-agent-execution` |
| Runtime traces and feedback | `agent-observability` |
| Least privilege and execution isolation | `agent-permissions-sandboxing` |
| Independent maker-checker verification | `independent-agent-verification` |
| Run budgets, termination, and escalation | `agent-run-lifecycle` |
| Regression suites, ablation, and harness measurement | `harness-evaluation` plus `ai-regression-testing` |

The seven builds intentionally combine these concepts instead of creating one concept per external lecture. Their sequence is represented by the `harness-engineering` roadmap and its milestone drills.
