# Security & Isolation Boundaries

Threat models, least privilege, capabilities, process and VM isolation, side channels, and secure defaults.

- Difficulty: core
- Tracks: Systems Foundations

## Mental model

Security is control over authority and information flow. Define the adversary, minimize ambient privilege, isolate tenants, validate boundaries, and fail closed. Scope: this card owns the principles — threat modelling, least privilege, capabilities, and failing closed. Which mechanism implements them, and at what cost, is `sandbox-execution-environments`; applying them to an agent is `agent-permissions-sandboxing`.



## Primary sources

- [The True Cost of Containing: A gVisor Case Study (HotCloud '19)](https://www.usenix.org/system/files/hotcloud19-paper-young.pdf) (doc)
- [USENIX NSDI '20 — Firecracker: Lightweight Virtualization for Serverless Applications](https://www.youtube.com/watch?v=cwruf1ERAKM) (video)
- [Firecracker: Lightweight Virtualization for Serverless Applications (NSDI '20)](https://www.usenix.org/conference/nsdi20/presentation/agache) (paper)
- [gVisor Architecture Guide](https://gvisor.dev/docs/architecture_guide/) (doc)

## Practice

### Design exercise: Security & Isolation Boundaries

Threat models, least privilege, capabilities, process and VM isolation, side channels, and secure defaults. Implement designOutline() returning non-empty values for: threatModel, trustBoundary, leastPrivilege. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with threatModel, trustBoundary, leastPrivilege plus an explicit failure mode or trade-off.

## Review prompts

- What does "fail closed" mean at a trust boundary, and why is it a design decision rather than an implementation detail?

## Build evidence

- **Synthesize: Systems Foundations** — Build a tiny HTTP/1.1 static-file server on raw TCP sockets without a framework or high-level HTTP server library. Parse requests, serve bounded files, handle partial I/O, inject failures, measure the result, and explain how the operating system, network, memory, concurrency, and storage paths interact.

## Prerequisites

- [Runtime & Performance Engineering](https://learn.significanthobbies.com/curriculum/concepts/runtime-performance-engineering.html)

## Related concepts

- [Runtime & Performance Engineering](https://learn.significanthobbies.com/curriculum/concepts/runtime-performance-engineering.html)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
