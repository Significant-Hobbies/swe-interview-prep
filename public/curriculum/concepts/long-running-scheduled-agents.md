# Long-running & Scheduled Agents

Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets.

- Difficulty: core
- Tracks: Agent Systems

## Mental model

Long-running agents are jobs with model decisions inside. They still need ownership, schedules, leases, cancellation, deadlines, observability, and bounded spend.



## Primary sources

- [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (doc)
- [Long-running Claude for Scientific Computing](https://www.anthropic.com/research/long-running-Claude) (doc)
- [Scaling Long-Horizon LLM Agent via Context-Folding](https://arxiv.org/abs/2510.11967) (paper)
- [Effective Harnesses for Long-running Agents (Anthropic)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (article)
- [Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) (doc)

## Practice

### Design exercise: Long-running & Scheduled Agents

Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets. Implement designOutline() returning non-empty values for: trigger, leaseHeartbeat, budget. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with trigger, leaseHeartbeat, budget plus an explicit failure mode or trade-off.

## Review prompts

- What does a lease give a scheduled agent that a cron entry alone does not?

## Build evidence

- **Synthesize: Agent Systems** — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing)

## Related concepts

- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing)

## Learning paths

- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w)
