# Containers & Kubernetes

Namespaces, cgroups, OCI images, container runtimes, Kubernetes scheduling, controllers, networking, and storage.

- Difficulty: core
- Tracks: Infrastructure & Platforms

## Mental model

A container is an isolated process; Kubernetes is a reconciliation system that continuously drives observed state toward declared state.



## Primary sources

- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/) (doc)

## Practice

### Design exercise: Containers & Kubernetes

Namespaces, cgroups, OCI images, container runtimes, Kubernetes scheduling, controllers, networking, and storage. Implement designOutline() returning non-empty values for: isolationPrimitive, desiredState, reconciliation. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with isolationPrimitive, desiredState, reconciliation plus an explicit failure mode or trade-off.

## Review prompts

- Kubernetes is described as a reconciliation system. What does that actually change about how it behaves?

## Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Cloud Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/cloud-infrastructure)

## Related concepts

- [Cloud Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/cloud-infrastructure)
- [CI/CD & Developer Environments](https://learn.significanthobbies.com/curriculum/concepts/cicd-developer-environments)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w)
