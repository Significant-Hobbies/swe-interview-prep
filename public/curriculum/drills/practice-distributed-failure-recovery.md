# Design exercise: Distributed Failure Recovery

> Partial failure, timeouts, retries, deduplication, fencing, repair, anti-entropy, and disaster recovery. Implement designOutline() returning non-empty values for: failureDetection, duplicateControl, repairPath. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-distributed-failure-recovery

Partial failure, timeouts, retries, deduplication, fencing, repair, anti-entropy, and disaster recovery. Implement designOutline() returning non-empty values for: failureDetection, duplicateControl, repairPath. Each value must name a concrete mechanism or decision.

## The mechanism

In a distributed system, failure is ambiguous. Recovery needs bounded retries, unique operation identity, stale-writer fencing, repair mechanisms, and tested restore objectives. Scope: this card owns correctness under partial failure — operation identity, fencing a stale writer, repair and anti-entropy, and tested restore objectives. What target you are recovering TO is `reliability-fault-tolerance`; the caller-side backoff policy is `retries-and-circuit-breakers`.

## Expected evidence

A design outline with failureDetection, duplicateControl, repairPath plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [The Network is Reliable (Bailis & Kingsbury)](https://aphyr.com/posts/288-the-network-is-reliable)
- [Gray Failure: The Achilles' Heel of Cloud-Scale Systems (HotOS '17)](https://www.microsoft.com/en-us/research/publication/gray-failure-achilles-heel-cloud-scale-systems/)
- [Partitions for Everyone! — Kyle Kingsbury (Strange Loop 2013)](https://www.youtube.com/watch?v=EOlw6dlxXU0)
- [Simple Testing Can Prevent Most Critical Failures (OSDI '14)](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/yuan)
- [Jepsen: etcd and Consul (Kyle Kingsbury)](https://aphyr.com/posts/316-jepsen-etcd-and-consul)
- [Site Reliability Engineering — Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)
- [Jepsen Analyses](https://jepsen.io/analyses)
- [Study Distributed Failure Recovery](https://learn.significanthobbies.com/curriculum/concepts/distributed-failure-recovery)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-distributed-failure-recovery)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
