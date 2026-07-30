# Sandboxes & Execution Environments

Processes, containers, microVMs, V8 isolates, WebAssembly, capabilities, quotas, and untrusted-code execution.

- Difficulty: core
- Tracks: Infrastructure & Platforms

## Mental model

A sandbox is a capability boundary plus resource accounting. Isolation strength, startup cost, syscall surface, and density must match the threat model. Scope: this card owns the mechanisms and their trade-offs — process, container, microVM, V8 isolate, WebAssembly — compared on isolation strength, startup cost, syscall surface and density. Deciding what you are defending against is `security-isolation-boundaries`.



## Primary sources

- [Swivel: Hardening WebAssembly against Spectre (USENIX Security '21)](https://www.usenix.org/system/files/sec21fall-narayan.pdf) (doc)
- [USENIX Enigma 2023 — Navigating the Sandbox Buffet](https://www.youtube.com/watch?v=KXZKaz4epgg) (video)
- [Bringing the Web up to Speed with WebAssembly (PLDI '17)](https://people.mpi-sws.org/~rossberg/papers/Haas,%20Rossberg,%20Schuff,%20Titzer,%20Gohman,%20Wagner,%20Zakai,%20Bastien,%20Holman%20-%20Bringing%20the%20Web%20up%20to%20Speed%20with%20WebAssembly.pdf) (paper)
- [Cloud Computing without Containers (Cloudflare Workers isolates)](https://blog.cloudflare.com/cloud-computing-without-containers/) (article)
- [Wasmtime Security](https://docs.wasmtime.dev/security.html) (doc)

## Practice

### Design exercise: Sandboxes & Execution Environments

Processes, containers, microVMs, V8 isolates, WebAssembly, capabilities, quotas, and untrusted-code execution. Implement designOutline() returning non-empty values for: threatModel, capabilities, resourceLimits. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with threatModel, capabilities, resourceLimits plus an explicit failure mode or trade-off.

## Review prompts

- Rank containers, microVMs, and V8 isolates on isolation strength versus startup cost, and say what drives the difference.

## Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics.html)

## Related concepts

- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics.html)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w.html)
