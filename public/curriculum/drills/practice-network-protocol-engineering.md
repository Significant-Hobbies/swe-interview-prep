# Design exercise: Network Protocol Engineering

> Packet flow across Ethernet, IP, TCP/QUIC, TLS, DNS, HTTP, load balancers, and application protocols. Implement designOutline() returning non-empty values for: protocolLayers, failureHandling, latencyBudget. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-network-protocol-engineering

Packet flow across Ethernet, IP, TCP/QUIC, TLS, DNS, HTTP, load balancers, and application protocols. Implement designOutline() returning non-empty values for: protocolLayers, failureHandling, latencyBudget. Each value must name a concrete mechanism or decision.

## The mechanism

Networks are layered state machines under delay, loss, duplication, and reordering. Reliability comes from explicit framing, identity, timeouts, congestion control, and retry semantics.

## Expected evidence

A design outline with protocolLayers, failureHandling, latencyBudget plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [RFC 9002: QUIC Loss Detection and Congestion Control](https://www.rfc-editor.org/rfc/rfc9002.html)
- [The QUIC Transport Protocol: Design and Internet-Scale Deployment (SIGCOMM '17)](https://research.google/pubs/the-quic-transport-protocol-design-and-internet-scale-deployment/)
- [BBR: Congestion-Based Congestion Control (ACM Queue 2016)](https://web.stanford.edu/class/cs244/papers/bbr.pdf)
- [USENIX NSDI '18 — Copa: Practical Delay-Based Congestion Control for the Internet](https://www.youtube.com/watch?v=FDAzVFmuVUY)
- [RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport](https://www.rfc-editor.org/rfc/rfc9000.html)
- [The Road to QUIC (Cloudflare)](https://blog.cloudflare.com/the-road-to-quic/)
- [High Performance Browser Networking](https://hpbn.co/)
- [Study Network Protocol Engineering](https://learn.significanthobbies.com/curriculum/concepts/network-protocol-engineering)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-network-protocol-engineering)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
