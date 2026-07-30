# Load Balancing

L4/L7, consistent hashing, health checks.

- Difficulty: core
- Tracks: System Design

## Mental model

A load balancer is the seam between "one address" and "many servers". L4 routes by IP/port (fast, dumb); L7 routes by request content (slower, smart). Health checks and the balancing algorithm (round-robin, least-connections, consistent hashing) decide who gets each request.


## Common mistakes

- Treating the load balancer as a single point of failure with no redundancy
- Round-robin to stateful servers that need sticky sessions
- No health checks, so traffic keeps hitting a dead instance

## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [Site Reliability Engineering (Google) — chapter 19: Load Balancing at the Frontend](https://sre.google/sre-book/load-balancing-frontend/) (doc)
- [Google SRE Book — Load Balancing in the Datacenter](https://sre.google/sre-book/load-balancing-datacenter/) (doc)
- [Envoy — Load balancing overview](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/overview) (doc)

## Practice

### L7 load balancer

Design an L7 load balancer in front of N application servers. Pick a routing algorithm (round-robin, least-connections, hashing), explain health checks, and how you drain a node.

**Expected evidence:** Routing decision tree + health-check loop + a graceful-drain sequence.

## Review prompts

- Round-robin is distributing requests evenly but tail latency is bad. What is the likely cause and the fix?


## Prerequisites

- None assigned.

## Related concepts

- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html)

## Learning paths

- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w.html)
