# Design exercise: Cloud Infrastructure

> Regions, zones, networks, compute, managed storage, identity, load balancing, and control planes. Implement designOutline() returning non-empty values for: failureDomains, statePlacement, recoveryPlan. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-cloud-infrastructure

Regions, zones, networks, compute, managed storage, identity, load balancing, and control planes. Implement designOutline() returning non-empty values for: failureDomains, statePlacement, recoveryPlan. Each value must name a concrete mechanism or decision.

## The mechanism

Cloud systems are distributed resource managers with failure domains. Architecture should make placement, identity, state ownership, and regional recovery explicit.

## Expected evidence

A design outline with failureDomains, statePlacement, recoveryPlan plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Above the Clouds: A Berkeley View of Cloud Computing (UCB/EECS-2009-28)](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2009/EECS-2009-28.pdf)
- [Cloud Programming Simplified: A Berkeley View on Serverless Computing](https://arxiv.org/abs/1902.03383)
- [USENIX SREcon24 Americas — Gray Failure: The Achilles' Heel of Cloud-Scale Systems](https://www.youtube.com/watch?v=WCW28-xA6lo)
- [Large-scale cluster management at Google with Borg (EuroSys 2015)](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/)
- [Kubernetes — Cluster Architecture](https://kubernetes.io/docs/concepts/architecture/)
- [AWS Builders Library](https://aws.amazon.com/builders-library/)
- [Study Cloud Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/cloud-infrastructure)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-cloud-infrastructure)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
