# Design exercise: Containers & Kubernetes

> Namespaces, cgroups, OCI images, container runtimes, Kubernetes scheduling, controllers, networking, and storage. Implement designOutline() returning non-empty values for: isolationPrimitive, desiredState, reconciliation. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-containers-kubernetes

Namespaces, cgroups, OCI images, container runtimes, Kubernetes scheduling, controllers, networking, and storage. Implement designOutline() returning non-empty values for: isolationPrimitive, desiredState, reconciliation. Each value must name a concrete mechanism or decision.

## The mechanism

A container is an isolated process; Kubernetes is a reconciliation system that continuously drives observed state toward declared state.

## Expected evidence

A design outline with isolationPrimitive, desiredState, reconciliation plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
- [Study Containers & Kubernetes](https://learn.significanthobbies.com/curriculum/concepts/containers-kubernetes)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-containers-kubernetes)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
