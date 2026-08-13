## Context

The curriculum is canonical JSON consumed through `learning-os.ts`; concepts, roadmaps, drills, reviews, and artifacts are joined by stable string IDs. System-design practice uses a shared `SystemDesignCase` schema and currently composes an eight-case base batch with a twelve-case popular batch. See `proposal.md` for motivation and the capability specs for observable behavior.

The two referenced repositories are useful coverage inventories, but their content and structure are neither runtime dependencies nor canonical product data. Existing Agent Systems, AI Reliability, Developer Tools, and Infrastructure concepts already cover much of harness engineering.

## Goals / Non-Goals

**Goals:**

- Make harness engineering learnable as a dependency-ordered, project-backed path.
- Fill the classic system-design case gaps without introducing another interview engine.
- Preserve stable IDs and route every new surface through existing concept, drill, artifact, and case contracts.
- Keep new content source-backed and testable.

**Non-Goals:**

- Vendor or copy either external repository into the generated library.
- Add a new top-level navigation tab, database schema, authentication requirement, or runtime dependency.
- Publish thin worked guides for all new cases in this batch.
- Add code-answer questions to Blitz where the interface cannot execute or grade code safely.

## Decisions

### Reuse existing concepts and add a small harness-specific layer

The roadmap will reuse repository intelligence, coding-agent systems, durable execution, permissions and sandboxing, observability, and AI regression testing. New concepts will represent only missing contracts such as instruction topology, environment bootstrap, work-state handoff, scope control, maker-checker verification, lifecycle termination, and harness evaluation.

This avoids a parallel “harness” vocabulary that would split mastery history. The alternative—duplicating every lecture topic as a new concept—was rejected because it would create overlapping Learn pages and ambiguous Blitz remediation.

### Represent the seven projects as roadmap drills plus synthesis artifacts

Each stage gets an editorial drill with an executable file- or command-based validation case. Integrated builds use artifacts to express multi-concept deliverables. This uses the current Playground and preserves one Practice surface rather than introducing a harness-only project runner.

### Add a separate authored classic-case module

The thirteen cases will live in one new typed module and use a local factory for the invariant schema portions. Case-specific prompts, calculations, evidence, failures, trade-offs, and sources remain explicit data. The aggregate case catalog imports the batch.

This keeps the mature base and popular batches stable and makes the coverage boundary easy to test. Expanding the existing 1,600-line file was rejected because it raises merge risk and obscures ownership.

### Keep the new cases practice-only initially

Every case will be complete for interactive practice but will not expose a public worked-guide URL until a guide independently meets the existing 1,200-word editorial contract. This prevents search-visible placeholder content while still providing the complete Tradeoff practice inventory.

### Enforce coverage with named inventories

Tests will assert the Harness roadmap milestones, seven progressive builds, thirteen case IDs, distinct patterns, valid concept/drill references, and total catalog count. Documentation will record which external curricula motivated the audit without using those sources as authority for technical claims.

## Risks / Trade-offs

- **Large authored-content diff** → Isolate the new case batch, make concept additions append-only, and run focused integrity checks before the full suite.
- **Factory-generated cases feel templated** → Share only schema scaffolding; require case-specific critical paths, calculations, evidence, failure injections, mistakes, and stronger answers.
- **Harness terms overlap existing concepts** → Maintain an explicit reuse map and add a concept only when no current ID owns the atomic skill.
- **Thirteen new cases widen editorial review load** → Ship them as practice-only, validate authoritative sources and mappings, and reserve public guides for a separate editorial batch.
- **Generated public curriculum drift** → Use the existing generator after canonical data changes and validate derived output rather than hand-editing generated files.

## Migration Plan

All changes are additive content and imports. Existing local attempts and mastery records remain keyed by unchanged IDs. Rollback is limited to removing the new roadmap entries, appended content records, new case module import, and regenerated derivatives; no data migration is required.
