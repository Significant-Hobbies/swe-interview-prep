# L7 load balancer

> Design an L7 load balancer in front of N application servers. Pick a routing algorithm (round-robin, least-connections, hashing), explain health checks, and how you drain a node.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-load-balancer

Design an L7 load balancer in front of N application servers. Pick a routing algorithm (round-robin, least-connections, hashing), explain health checks, and how you drain a node.

## The mechanism

A load balancer is the seam between "one address" and "many servers". L4 routes by IP/port (fast, dumb); L7 routes by request content (slower, smart). Health checks and the balancing algorithm (round-robin, least-connections, consistent hashing) decide who gets each request.

## Expected evidence

Routing decision tree + health-check loop + a graceful-drain sequence.

## Hints

- Sticky sessions cost you flexibility — only enable when needed.
- Health checks should mimic real traffic, not just /ping.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Site Reliability Engineering (Google) — chapter 19: Load Balancing at the Frontend](https://sre.google/sre-book/load-balancing-frontend/)
- [Google SRE Book — Load Balancing in the Datacenter](https://sre.google/sre-book/load-balancing-datacenter/)
- [Envoy — Load balancing overview](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/overview)
- [Study Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-load-balancer)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
