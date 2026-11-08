# Design exercise: Long-running & Scheduled Agents

> Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets. Implement designOutline() returning non-empty values for: trigger, leaseHeartbeat, budget. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-long-running-scheduled-agents

Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets. Implement designOutline() returning non-empty values for: trigger, leaseHeartbeat, budget. Each value must name a concrete mechanism or decision.

## The mechanism

Long-running agents are jobs with model decisions inside. They still need ownership, schedules, leases, cancellation, deadlines, observability, and bounded spend.

## Expected evidence

A design outline with trigger, leaseHeartbeat, budget plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Long-running Claude for Scientific Computing](https://www.anthropic.com/research/long-running-Claude)
- [Scaling Long-Horizon LLM Agent via Context-Folding](https://arxiv.org/abs/2510.11967)
- [Effective Harnesses for Long-running Agents (Anthropic)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Study Long-running & Scheduled Agents](https://learn.significanthobbies.com/curriculum/concepts/long-running-scheduled-agents)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-long-running-scheduled-agents)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
