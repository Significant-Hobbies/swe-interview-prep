# Distributed Infra

Service discovery, orchestration.

- Difficulty: advanced
- Tracks: Distributed Systems, System Design

## Mental model

Distributed systems multiply the ways things can fail. Every network call can be slow, retried, lost, or duplicated. Design for partial failure first — timeouts, idempotency, bounded queues — and worry about speed second.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [Kubernetes — Cluster components](https://kubernetes.io/docs/concepts/overview/components/) (doc)
- [Consul — Service discovery explained](https://developer.hashicorp.com/consul/docs/concepts/service-discovery) (doc)
- [Large-scale cluster management at Google with Borg (EuroSys 2015)](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/) (paper)

## Practice

### Distributed rate limiter

Design a rate limiter for an API: 1000 req/min per user, deployed across 10 app servers. Compare token bucket vs sliding window, and where the counter lives.

**Expected evidence:** Algorithm choice + storage backend (Redis?) + how you handle a Redis outage.

## Review prompts

- A remote call times out. What do you actually know about whether it executed?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus)

## Related concepts

- None assigned.

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
