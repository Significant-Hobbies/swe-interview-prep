# Cloud Infrastructure

Regions, zones, networks, compute, managed storage, identity, load balancing, and control planes.

- Difficulty: core
- Tracks: Infrastructure & Platforms

## Mental model

Cloud systems are distributed resource managers with failure domains. Architecture should make placement, identity, state ownership, and regional recovery explicit.



## Primary sources

- [Above the Clouds: A Berkeley View of Cloud Computing (UCB/EECS-2009-28)](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2009/EECS-2009-28.pdf) (doc)
- [Cloud Programming Simplified: A Berkeley View on Serverless Computing](https://arxiv.org/abs/1902.03383) (doc)
- [USENIX SREcon24 Americas — Gray Failure: The Achilles' Heel of Cloud-Scale Systems](https://www.youtube.com/watch?v=WCW28-xA6lo) (video)
- [Large-scale cluster management at Google with Borg (EuroSys 2015)](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/) (paper)
- [Kubernetes — Cluster Architecture](https://kubernetes.io/docs/concepts/architecture/) (doc)
- [AWS Builders Library](https://aws.amazon.com/builders-library/) (doc)

## Practice

### Design exercise: Cloud Infrastructure

Regions, zones, networks, compute, managed storage, identity, load balancing, and control planes. Implement designOutline() returning non-empty values for: failureDomains, statePlacement, recoveryPlan. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with failureDomains, statePlacement, recoveryPlan plus an explicit failure mode or trade-off.

## Review prompts

- What is a failure domain, and why does multi-AZ buy something multi-instance does not?

## Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [Containers & Kubernetes](https://learn.significanthobbies.com/curriculum/concepts/containers-kubernetes.html)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w.html)
