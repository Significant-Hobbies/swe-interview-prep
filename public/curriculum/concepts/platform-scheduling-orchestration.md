# Scheduling & Orchestration

Placement, queues, priorities, quotas, fairness, preemption, autoscaling, and reconciliation loops.

- Difficulty: core
- Tracks: Infrastructure & Platforms

## Mental model

Schedulers match constrained work to finite resources. Good orchestration separates desired state, placement policy, execution, observation, and correction.



## Primary sources

- [Large-scale cluster management at Google with Borg (EuroSys 2015)](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/) (doc)

## Practice

### Design exercise: Scheduling & Orchestration

Placement, queues, priorities, quotas, fairness, preemption, autoscaling, and reconciliation loops. Implement designOutline() returning non-empty values for: resourceModel, placementPolicy, fairness. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with resourceModel, placementPolicy, fairness plus an explicit failure mode or trade-off.

## Review prompts

- What does preemption solve that priority queues alone do not?

## Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [CI/CD & Developer Environments](https://learn.significanthobbies.com/curriculum/concepts/cicd-developer-environments)

## Related concepts

- [CI/CD & Developer Environments](https://learn.significanthobbies.com/curriculum/concepts/cicd-developer-environments)
- [Infrastructure Automation](https://learn.significanthobbies.com/curriculum/concepts/infrastructure-automation)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w)
