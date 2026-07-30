# Systems Lab

Scope: the deterministic, client-only systems learning surface at `/labs`.
This page documents the product boundary and authoring contract; checked-in
definitions remain the executable source of truth.

## Learning loop

Each attempt follows one evidence-gated sequence:

1. Select a checked-in scenario and inspect every input.
2. Freeze a prediction; it cannot be edited within that attempt.
3. Repair the lab's broken infrastructure configuration and satisfy every
   deterministic setup contract.
4. Start, single-step, run to the next decision, or finish the virtual-time
   simulation.
5. Inspect evidence owned by the actor and truth plane that produced it.
6. Compare the frozen prediction with the deterministic outcome.
7. Explain the causal chain, decisive evidence, and one counterfactual.
8. For an authenticated learner, the existing Feynman grader may apply FSRS
   ratings and schedule linked review questions.

Completion and a correct guess do not update mastery. Guest attempts and
explanations remain local with mastery labeled `pending`. An authenticated
explanation cannot be graded until the configuration challenge passes.
A verified configuration is reused across scenarios of the same lab definition
version; learners repair each infrastructure stack once rather than repeating
the same setup for every counterfactual.

Versioned replay JSON can reproduce the selected scenario and exact action
sequence. Imported replays run in observation mode and cannot complete an
attempt, grade an explanation, or update mastery.

## Safety boundary

The simulator is a model, not an emulator. It has no Kubernetes client, Git
remote, cloud SDK, shell, credential input, database connection, or runtime
network dependency. Actors, transitions, evidence, and virtual timestamps are
plain checked-in data reduced by a pure client-side engine.

This boundary is intentional:

- A scenario cannot mutate a real system.
- Identical definition versions and action sequences serialize to identical
  snapshots.
- Invalid actor references, transition targets, cycles, unreachable steps,
  concept IDs, and decisive-evidence references fail validation.
- A new definition version does not silently reuse an older attempt as current
  evidence.

External links at the end of each lab are optional primary-source reading.
Opening one is outside simulation execution.

## Fidelity and source contracts

Every published lab declares a fidelity level:

- `modeled`: reviewed internal model with no upstream verification claim.
- `source-verified`: key rules are checked against pinned upstream source or
  upstream test vectors.
- `oracle-verified`: reserved for a future executable upstream oracle; the
  definition validator rejects this label without an executable-oracle
  provenance record.

Provenance records pin a full commit SHA, reviewed source paths, license,
verification method, and date. Checked-in source-contract fixtures assert the
smallest observable consequence of those rules. Mutation tests deliberately
reverse the Argo projection, ParentBased branch, and PodMonitoring selector
semantics; each mutation must produce a source-contract mismatch.

These checks increase confidence without claiming full behavioral parity. They
do not turn the browser model into Argo CD, Kubernetes, ESO, OpenTelemetry, or
Managed Service for Prometheus.

## Initial labs

- **GitOps, secrets, and migration truth:** Git revision, Argo CD sync and
  operation state, asynchronous ESO reconciliation, Kubernetes Job retry
  state, durable database revision, and rollout readiness. Build mode repairs
  a protected production release reference, manual promotion gate, sync waves, Secret
  ownership, and bounded Job behavior.
- **Trace context and the sampling branch:** extraction, remote-parent flags,
  the selected ParentBased delegate, SDK recording, export, and Collector
  receipt. Build mode wires W3C propagation, ParentBased root sampling, OTLP,
  batching, and Google Cloud export.
- **Metrics discovery and ingestion:** process endpoint, Pod labels,
  PodMonitoring, target discovery, named-port resolution, HTTP scrape,
  storage, and PromQL results. Build mode joins workload labels to
  PodMonitoring, repairs named-port and scrape settings, and writes the first
  verification query.

Each lab includes healthy and failure counterfactuals. A scenario may
deliberately end with states such as `Synced`, `Healthy`, `Failed`, and
`dirty` at the same time because those labels belong to different truth
planes.

## Authoring contract

Add or change a lab only through the typed definitions under
`src/data/systems-labs/`.

- Reuse an existing concept ID; do not expand the curriculum to land a lab.
- Increment the definition version when an outcome, transition, control, or
  evidence meaning changes.
- Provide a broken configuration, a discoverable delivery brief, stable slot
  markers, causal hints, and evidence for every required repair.
- Update pinned provenance and its source-contract fixture when an upstream
  rule changes; do not point verification records at a mutable branch.
- Every transition references one known actor and an explicit next transition
  or terminal `null`.
- Every expected outcome names final actor states and evidence IDs produced by
  the reachable path.
- Decisive evidence describes what proves the outcome, not merely what happened
  nearby.
- Add a scenario assertion that localizes the intended mechanism.
- Add a mutation that would be detected when the change introduces a new
  source-verified mechanism.

Run the focused checks documented in
[`../development/commands.md`](../development/commands.md) before the full
repository gates.
