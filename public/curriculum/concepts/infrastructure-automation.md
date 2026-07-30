# Infrastructure Automation

Declarative infrastructure, state, plans, drift detection, policy checks, secrets boundaries, and safe changes.

- Difficulty: core
- Tracks: Infrastructure & Platforms

## Mental model

Infrastructure automation is a convergent state machine. Desired configuration, observed state, diff, approval, and rollback must all be inspectable.



## Primary sources

- [Terraform Language Documentation](https://developer.hashicorp.com/terraform/language) (doc)

## Practice

### Design exercise: Infrastructure Automation

Declarative infrastructure, state, plans, drift detection, policy checks, secrets boundaries, and safe changes. Implement designOutline() returning non-empty values for: desiredState, driftDetection, changeSafety. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with desiredState, driftDetection, changeSafety plus an explicit failure mode or trade-off.

## Review prompts

- What is drift, and why does a declarative tool need a plan step rather than just applying?

## Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Scheduling & Orchestration](https://learn.significanthobbies.com/curriculum/concepts/platform-scheduling-orchestration.html)

## Related concepts

- [Scheduling & Orchestration](https://learn.significanthobbies.com/curriculum/concepts/platform-scheduling-orchestration.html)
- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs.html)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w.html)
