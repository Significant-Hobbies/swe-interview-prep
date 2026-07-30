# Software Supply-chain Health

Dependency provenance, lockfiles, SBOMs, signing, build integrity, vulnerabilities, update policy, and release attestations.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

Supply-chain security proves what entered a build and how the artifact was produced. Pin inputs, generate provenance, scan risk, and verify signatures at promotion boundaries.



## Primary sources

- [SLSA Specification](https://slsa.dev/spec/v1.1/) (doc)
- [USENIX Security '19 — in-toto: farm-to-table guarantees for bits and bytes](https://www.youtube.com/watch?v=gLVmWA7LBjA) (video)
- [in-toto: Providing farm-to-table guarantees for bits and bytes](https://www.usenix.org/conference/usenixsecurity19/presentation/torres-arias) (paper)
- [Sigstore — overview (signing, transparency log, attestations)](https://docs.sigstore.dev/about/overview/) (doc)
- [Our Software Dependency Problem (Russ Cox)](https://research.swtch.com/deps) (article)

## Practice

### Design exercise: Software Supply-chain Health

Dependency provenance, lockfiles, SBOMs, signing, build integrity, vulnerabilities, update policy, and release attestations. Implement designOutline() returning non-empty values for: provenance, dependencyPolicy, artifactVerification. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with provenance, dependencyPolicy, artifactVerification plus an explicit failure mode or trade-off.

## Review prompts

- An SBOM and a provenance attestation answer different questions. What are they?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems.html)

## Related concepts

- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems.html)
- [Automated Debugging & Remediation](https://learn.significanthobbies.com/curriculum/concepts/automated-debugging-remediation.html)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w.html)
