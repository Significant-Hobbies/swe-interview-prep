# Design exercise: Scheduling & Orchestration

> Placement, queues, priorities, quotas, fairness, preemption, autoscaling, and reconciliation loops. Implement designOutline() returning non-empty values for: resourceModel, placementPolicy, fairness. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-platform-scheduling-orchestration

Placement, queues, priorities, quotas, fairness, preemption, autoscaling, and reconciliation loops. Implement designOutline() returning non-empty values for: resourceModel, placementPolicy, fairness. Each value must name a concrete mechanism or decision.

## The mechanism

Schedulers match constrained work to finite resources. Good orchestration separates desired state, placement policy, execution, observation, and correction.

## Expected evidence

A design outline with resourceModel, placementPolicy, fairness plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Large-scale cluster management at Google with Borg (EuroSys 2015)](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/)
- [Study Scheduling & Orchestration](https://learn.significanthobbies.com/curriculum/concepts/platform-scheduling-orchestration)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-platform-scheduling-orchestration)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
