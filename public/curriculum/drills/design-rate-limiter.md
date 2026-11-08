# Distributed rate limiter

> Design a rate limiter for an API: 1000 req/min per user, deployed across 10 app servers. Compare token bucket vs sliding window, and where the counter lives.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-rate-limiter

Design a rate limiter for an API: 1000 req/min per user, deployed across 10 app servers. Compare token bucket vs sliding window, and where the counter lives.

## The mechanism

Distributed systems multiply the ways things can fail. Every network call can be slow, retried, lost, or duplicated. Design for partial failure first — timeouts, idempotency, bounded queues — and worry about speed second.

## Expected evidence

Algorithm choice + storage backend (Redis?) + how you handle a Redis outage.

## Hints

- Per-instance counters undercount; central counters add latency.
- Approximation (e.g. sketch) can be acceptable.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Kubernetes — Cluster components](https://kubernetes.io/docs/concepts/overview/components/)
- [Consul — Service discovery explained](https://developer.hashicorp.com/consul/docs/concepts/service-discovery)
- [Large-scale cluster management at Google with Borg (EuroSys 2015)](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/)
- [Study Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-rate-limiter)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
