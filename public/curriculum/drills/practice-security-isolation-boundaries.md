# Design exercise: Security & Isolation Boundaries

> Threat models, least privilege, capabilities, process and VM isolation, side channels, and secure defaults. Implement designOutline() returning non-empty values for: threatModel, trustBoundary, leastPrivilege. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-security-isolation-boundaries

Threat models, least privilege, capabilities, process and VM isolation, side channels, and secure defaults. Implement designOutline() returning non-empty values for: threatModel, trustBoundary, leastPrivilege. Each value must name a concrete mechanism or decision.

## The mechanism

Security is control over authority and information flow. Define the adversary, minimize ambient privilege, isolate tenants, validate boundaries, and fail closed. Scope: this card owns the principles — threat modelling, least privilege, capabilities, and failing closed. Which mechanism implements them, and at what cost, is `sandbox-execution-environments`; applying them to an agent is `agent-permissions-sandboxing`.

## Expected evidence

A design outline with threatModel, trustBoundary, leastPrivilege plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [The True Cost of Containing: A gVisor Case Study (HotCloud '19)](https://www.usenix.org/system/files/hotcloud19-paper-young.pdf)
- [USENIX NSDI '20 — Firecracker: Lightweight Virtualization for Serverless Applications](https://www.youtube.com/watch?v=cwruf1ERAKM)
- [Firecracker: Lightweight Virtualization for Serverless Applications (NSDI '20)](https://www.usenix.org/conference/nsdi20/presentation/agache)
- [gVisor Architecture Guide](https://gvisor.dev/docs/architecture_guide/)
- [Study Security & Isolation Boundaries](https://learn.significanthobbies.com/curriculum/concepts/security-isolation-boundaries)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-security-isolation-boundaries)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
