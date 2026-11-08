# Design exercise: Sandboxes & Execution Environments

> Processes, containers, microVMs, V8 isolates, WebAssembly, capabilities, quotas, and untrusted-code execution. Implement designOutline() returning non-empty values for: threatModel, capabilities, resourceLimits. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-sandbox-execution-environments

Processes, containers, microVMs, V8 isolates, WebAssembly, capabilities, quotas, and untrusted-code execution. Implement designOutline() returning non-empty values for: threatModel, capabilities, resourceLimits. Each value must name a concrete mechanism or decision.

## The mechanism

A sandbox is a capability boundary plus resource accounting. Isolation strength, startup cost, syscall surface, and density must match the threat model. Scope: this card owns the mechanisms and their trade-offs — process, container, microVM, V8 isolate, WebAssembly — compared on isolation strength, startup cost, syscall surface and density. Deciding what you are defending against is `security-isolation-boundaries`.

## Expected evidence

A design outline with threatModel, capabilities, resourceLimits plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Swivel: Hardening WebAssembly against Spectre (USENIX Security '21)](https://www.usenix.org/system/files/sec21fall-narayan.pdf)
- [USENIX Enigma 2023 — Navigating the Sandbox Buffet](https://www.youtube.com/watch?v=KXZKaz4epgg)
- [Bringing the Web up to Speed with WebAssembly (PLDI '17)](https://people.mpi-sws.org/~rossberg/papers/Haas,%20Rossberg,%20Schuff,%20Titzer,%20Gohman,%20Wagner,%20Zakai,%20Bastien,%20Holman%20-%20Bringing%20the%20Web%20up%20to%20Speed%20with%20WebAssembly.pdf)
- [Cloud Computing without Containers (Cloudflare Workers isolates)](https://blog.cloudflare.com/cloud-computing-without-containers/)
- [Wasmtime Security](https://docs.wasmtime.dev/security.html)
- [Study Sandboxes & Execution Environments](https://learn.significanthobbies.com/curriculum/concepts/sandbox-execution-environments)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-sandbox-execution-environments)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
