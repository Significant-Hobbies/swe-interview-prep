# Design exercise: Software Supply-chain Health

> Dependency provenance, lockfiles, SBOMs, signing, build integrity, vulnerabilities, update policy, and release attestations. Implement designOutline() returning non-empty values for: provenance, dependencyPolicy, artifactVerification. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-software-supply-chain-health

Dependency provenance, lockfiles, SBOMs, signing, build integrity, vulnerabilities, update policy, and release attestations. Implement designOutline() returning non-empty values for: provenance, dependencyPolicy, artifactVerification. Each value must name a concrete mechanism or decision.

## The mechanism

Supply-chain security proves what entered a build and how the artifact was produced. Pin inputs, generate provenance, scan risk, and verify signatures at promotion boundaries.

## Expected evidence

A design outline with provenance, dependencyPolicy, artifactVerification plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [SLSA Specification](https://slsa.dev/spec/v1.1/)
- [USENIX Security '19 — in-toto: farm-to-table guarantees for bits and bytes](https://www.youtube.com/watch?v=gLVmWA7LBjA)
- [in-toto: Providing farm-to-table guarantees for bits and bytes](https://www.usenix.org/conference/usenixsecurity19/presentation/torres-arias)
- [Sigstore — overview (signing, transparency log, attestations)](https://docs.sigstore.dev/about/overview/)
- [Our Software Dependency Problem (Russ Cox)](https://research.swtch.com/deps)
- [Study Software Supply-chain Health](https://learn.significanthobbies.com/curriculum/concepts/software-supply-chain-health)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-software-supply-chain-health)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
