# Network Protocol Engineering

Packet flow across Ethernet, IP, TCP/QUIC, TLS, DNS, HTTP, load balancers, and application protocols.

- Difficulty: core
- Tracks: Systems Foundations

## Mental model

Networks are layered state machines under delay, loss, duplication, and reordering. Reliability comes from explicit framing, identity, timeouts, congestion control, and retry semantics.



## Primary sources

- [RFC 9002: QUIC Loss Detection and Congestion Control](https://www.rfc-editor.org/rfc/rfc9002.html) (doc)
- [The QUIC Transport Protocol: Design and Internet-Scale Deployment (SIGCOMM '17)](https://research.google/pubs/the-quic-transport-protocol-design-and-internet-scale-deployment/) (doc)
- [BBR: Congestion-Based Congestion Control (ACM Queue 2016)](https://web.stanford.edu/class/cs244/papers/bbr.pdf) (doc)
- [USENIX NSDI '18 — Copa: Practical Delay-Based Congestion Control for the Internet](https://www.youtube.com/watch?v=FDAzVFmuVUY) (video)
- [RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport](https://www.rfc-editor.org/rfc/rfc9000.html) (paper)
- [The Road to QUIC (Cloudflare)](https://blog.cloudflare.com/the-road-to-quic/) (article)
- [High Performance Browser Networking](https://hpbn.co/) (doc)

## Practice

### Design exercise: Network Protocol Engineering

Packet flow across Ethernet, IP, TCP/QUIC, TLS, DNS, HTTP, load balancers, and application protocols. Implement designOutline() returning non-empty values for: protocolLayers, failureHandling, latencyBudget. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with protocolLayers, failureHandling, latencyBudget plus an explicit failure mode or trade-off.

## Review prompts

- A TCP connection is "reliable". Name two failures it does not protect you from.

## Build evidence

- **Synthesize: Systems Foundations** — Build a tiny HTTP/1.1 static-file server on raw TCP sockets without a framework or high-level HTTP server library. Parse requests, serve bounded files, handle partial I/O, inject failures, measure the result, and explain how the operating system, network, memory, concurrency, and storage paths interact.

## Prerequisites

- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html)

## Related concepts

- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html)
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
