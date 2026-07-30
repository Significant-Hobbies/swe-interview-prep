## Why

The learning OS explains infrastructure and production-engineering concepts,
but its current hands-on surfaces are code- and diagram-oriented. Learners need
a safe way to manipulate controller timing, failure states, propagation flags,
and observability discovery without cloud credentials or a live Kubernetes
environment—and then prove they understand the result instead of merely
watching an animation.

## What Changes

- Add a first-class Systems Lab index and lab runner inside the existing
  product, without renaming the repository, product, or existing routes.
- Add a deterministic, client-only simulation engine driven by typed lab and
  scenario definitions. It must make no network, Kubernetes, cloud, or local
  machine connection.
- Ship three initial labs:
  - Git → Argo CD → External Secrets → migration Job → Deployment.
  - Trace propagation → ParentBased sampling → OpenTelemetry export.
  - Metrics endpoint → workload selection → scrape → stored/queryable series.
- Structure every lab as predict → configure → run/step → inspect evidence →
  explain back, including counterexamples where superficially healthy state is
  misleading.
- Add a bounded Build mode to every initial lab. Learners repair a broken
  infrastructure configuration against a visible delivery brief and causal
  validation hints before their explanation becomes mastery-eligible.
- Connect successful evidence-based explain-backs to the existing Feynman and
  FSRS mastery loop; viewing or clicking through a simulation alone must not
  grant mastery.
- Preserve the current visual language and primary navigation. The first
  release is entered from relevant Learn, concept, and Build surfaces rather
  than silently adding or renaming a primary tab.
- Keep the existing real local platform lab as optional external verification,
  not a runtime dependency or browser integration.

## Capabilities

### New Capabilities

- `systems-simulation-labs`: Defines the disconnected simulation engine, lab
  catalog, lab runner, deterministic state transitions, evidence views, and the
  three initial infrastructure/observability labs.
- `simulation-mastery-loop`: Defines prediction capture, outcome comparison,
  explain-back gating, concept mapping, and existing FSRS mastery updates for
  simulation attempts.

### Modified Capabilities

None. Existing OpenSpec requirements for curriculum publication, expanded
domains, and unified navigation remain unchanged.

## Impact

- Frontend: new lazy routes and React surfaces under the existing Vite SPA;
  reusable typed simulation state in `src/lib/` and lab definitions in
  `src/data/`.
- Learning state: reuses existing concept mastery/Feynman paths and guest
  local-state conventions; no schema migration or new API is required for the
  first release.
- Content: maps each lab to existing concept IDs and adds contextual entry
  points without moving or renaming `docs/learning/*`.
- Design: preserve lane using existing UI primitives and tokens; no new
  production dependency is expected.
- Operations: no connection to GKE, Argo CD, Secret Manager, Cloud Trace,
  Prometheus, production Git, or user kubeconfigs.
