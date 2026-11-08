# Design exercise: CI/CD & Developer Environments

> Hermetic builds, reproducible environments, test gates, artifacts, previews, progressive delivery, and rollback. Implement designOutline() returning non-empty values for: reproducibleBuild, qualityGates, rollback. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-cicd-developer-environments

Hermetic builds, reproducible environments, test gates, artifacts, previews, progressive delivery, and rollback. Implement designOutline() returning non-empty values for: reproducibleBuild, qualityGates, rollback. Each value must name a concrete mechanism or decision.

## The mechanism

A delivery pipeline converts source into a traceable artifact through reproducible gates. Promotion should move the same artifact, not rebuild it differently in each environment.

## Expected evidence

A design outline with reproducibleBuild, qualityGates, rollback plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Build Systems and Build Philosophy — Software Engineering at Google, Ch. 18](https://abseil.io/resources/swe-book/html/ch18.html)
- [DORA — Capabilities: Trunk-based development](https://dora.dev/capabilities/trunk-based-development/)
- [Google Testing Blog — Hermetic Servers](https://testing.googleblog.com/2012/10/hermetic-servers.html)
- [USENIX SREcon25 EMEA — Making Reproducible Builds Faster with Docker Bake](https://www.youtube.com/watch?v=BY5v7QsfVwI)
- [DORA — Capabilities: Continuous integration](https://dora.dev/capabilities/continuous-integration/)
- [Continuous Integration — Software Engineering at Google, Ch. 23](https://abseil.io/resources/swe-book/html/ch23.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Study CI/CD & Developer Environments](https://learn.significanthobbies.com/curriculum/concepts/cicd-developer-environments)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-cicd-developer-environments)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
