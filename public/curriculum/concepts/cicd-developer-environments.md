# CI/CD & Developer Environments

Hermetic builds, reproducible environments, test gates, artifacts, previews, progressive delivery, and rollback.

- Difficulty: core
- Tracks: Infrastructure & Platforms

## Mental model

A delivery pipeline converts source into a traceable artifact through reproducible gates. Promotion should move the same artifact, not rebuild it differently in each environment.



## Primary sources

- [Build Systems and Build Philosophy — Software Engineering at Google, Ch. 18](https://abseil.io/resources/swe-book/html/ch18.html) (doc)
- [DORA — Capabilities: Trunk-based development](https://dora.dev/capabilities/trunk-based-development/) (doc)
- [Google Testing Blog — Hermetic Servers](https://testing.googleblog.com/2012/10/hermetic-servers.html) (doc)
- [USENIX SREcon25 EMEA — Making Reproducible Builds Faster with Docker Bake](https://www.youtube.com/watch?v=BY5v7QsfVwI) (video)
- [DORA — Capabilities: Continuous integration](https://dora.dev/capabilities/continuous-integration/) (article)
- [Continuous Integration — Software Engineering at Google, Ch. 23](https://abseil.io/resources/swe-book/html/ch23.html) (doc)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) (doc)

## Practice

### Design exercise: CI/CD & Developer Environments

Hermetic builds, reproducible environments, test gates, artifacts, previews, progressive delivery, and rollback. Implement designOutline() returning non-empty values for: reproducibleBuild, qualityGates, rollback. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with reproducibleBuild, qualityGates, rollback plus an explicit failure mode or trade-off.

## Review prompts

- Why must promotion move the same artifact rather than rebuild per environment?

## Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Containers & Kubernetes](https://learn.significanthobbies.com/curriculum/concepts/containers-kubernetes)

## Related concepts

- [Containers & Kubernetes](https://learn.significanthobbies.com/curriculum/concepts/containers-kubernetes)
- [Scheduling & Orchestration](https://learn.significanthobbies.com/curriculum/concepts/platform-scheduling-orchestration)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w)
