## 1. Work Boundary and Design Evidence

- [x] 1.1 Create the owning GitHub issue and link this OpenSpec change before feature implementation
- [x] 1.2 Initialize missing product/design context through the required Impeccable workflow without changing the established product identity
- [x] 1.3 Create a preserve-lane design-review receipt for the Systems Lab catalog and runner
- [ ] 1.4 Capture before-state browser evidence for the Learn, Build Lab, Playground, and compact-layout patterns being reused

## 2. Simulation Engine

- [x] 2.1 Add typed lab, actor, transition, evidence, checkpoint, prediction, and snapshot contracts
- [x] 2.2 Implement the pure virtual-time reducer with start, step, advance, finish, and reset actions
- [x] 2.3 Implement shared primitives for branching, queued reconciliation, retry/backoff, health projection, and evidence emission
- [x] 2.4 Add static definition validation for IDs, concept references, transition targets, reachability, and expected outcomes
- [x] 2.5 Add deterministic serialization and replay tests proving identical inputs produce byte-equivalent snapshots
- [x] 2.6 Add invalid-definition and unreachable-state tests that fail closed

## 3. GitOps and Migration Lab

- [x] 3.1 Define Git, Argo CD, ESO, Secret, Job, database, and Deployment actors and truth planes
- [x] 3.2 Implement the healthy wave -2, wave -1, and wave 0 scenario with database revision evidence
- [x] 3.3 Implement delayed and failed ESO reconciliation scenarios with Argo wait behavior
- [x] 3.4 Implement partial migration failure, Kubernetes retry exhaustion, and blocked rollout behavior
- [x] 3.5 Implement the hook-only revision scenario that can remain ordinarily Synced
- [x] 3.6 Add scenario assertion tests for health, sync, operation, Job, database, and workload evidence

## 4. Trace Propagation and Sampling Lab

- [x] 4.1 Define header, propagator, parent context, sampler branch, span, exporter, and Collector actors
- [x] 4.2 Implement remote-unsampled default ParentBased behavior that bypasses the root ratio
- [x] 4.3 Implement the edge override that routes both remote-parent branches through the configured ratio
- [x] 4.4 Implement trusted sampled-parent and root-ratio counterfactual scenarios
- [x] 4.5 Add scenario assertion tests proving exactly when Collector evidence exists

## 5. Metrics Discovery and Ingestion Lab

- [x] 5.1 Define process, Pod labels, PodMonitoring, discovery, scrape, storage, and query actors
- [x] 5.2 Implement the healthy endpoint-selection-scrape-storage-query path
- [x] 5.3 Implement a selector-miss scenario where the endpoint and manifest remain independently valid
- [x] 5.4 Implement named-port and scrape-response failure scenarios after successful discovery
- [x] 5.5 Add scenario assertion tests for target count, scrape evidence, stored series, and query results

## 6. Shared Catalog and Runner

- [x] 6.1 Add the checked-in lab registry and catalog metadata with existing concept mappings and definition versions
- [x] 6.2 Add a lazy `/labs` catalog route using existing page-shell, card, empty-state, and responsive patterns
- [x] 6.3 Add a lazy `/labs/:labId` shared runner route with unknown-lab handling
- [x] 6.4 Build scenario and control selection with all inputs visible during execution
- [x] 6.5 Build the current actor/state view without collapsing independent truth planes
- [x] 6.6 Build the ordered event timeline and actor-owned evidence inspector
- [x] 6.7 Add reset, single-step, run-to-next-decision, and complete-execution controls
- [x] 6.8 Add keyboard semantics, live status announcements, focus behavior, and reduced-motion handling

## 7. Prediction, Evidence, and Mastery

- [x] 7.1 Add account-scoped local attempt types and storage without a database or API change
- [x] 7.2 Implement editable drafts, frozen predictions, free exploration, retries, and definition-version handling
- [x] 7.3 Add deterministic prediction comparison and decisive-evidence checkpoints
- [x] 7.4 Build scenario-grounded explain-back context from prediction, outcome, and evidence
- [x] 7.5 Generalize the existing authenticated Feynman path to accept a systems-lab artifact without regressing code/drill grading
- [x] 7.6 Apply accepted ratings through the existing concept mastery authority and schedule linked review questions
- [x] 7.7 Preserve guest attempts locally while labeling mastery pending rather than fabricating credit
- [x] 7.8 Add guest, authenticated, failed-checkpoint, retry, skip, and successful-mastery tests

## 8. Contextual Integration

- [x] 8.1 Add Systems Lab entry points to relevant Learn content without changing primary navigation
- [x] 8.2 Add relevant concept-detail links derived from the lab registry rather than hardcoded per page
- [x] 8.3 Add a Build Lab entry point while preserving existing artifact and drill routes
- [x] 8.4 Add analytics events through the existing wrapper for lab opened, prediction frozen, evidence checked, explanation graded, and lab completed
- [x] 8.5 Confirm the unfinished Sweep OpenSpec and all generated curriculum surfaces remain unchanged

## 9. Verification and Documentation

- [x] 9.1 Run focused engine, definition, route, attempt, and mastery tests
- [x] 9.2 Run repository typecheck, lint, full unit tests, docs validation, and production build
- [x] 9.3 Verify offline execution and confirm the runner makes no external requests
- [ ] 9.4 Capture runner browser evidence at 390, 768, and 1440 pixels and verify keyboard-only completion
- [ ] 9.5 Run Impeccable critique, polish, and audit; resolve every P0/P1 and meet the Fleet score floors
- [x] 9.6 Update canonical product, architecture, surface, command, and learning documentation for the shipped capability
- [ ] 9.7 Validate the design-review receipt and obtain owner `keep` or `delegated` feedback
- [x] 9.8 Run strict OpenSpec validation before requesting implementation review

## 10. Source-grounded Robustness

- [x] 10.1 Add full-commit upstream provenance, source paths, licenses, methods, and verification dates to every lab
- [x] 10.2 Validate fidelity claims and reserve `oracle-verified` for definitions backed by an executable upstream oracle
- [x] 10.3 Add checked-in source-contract fixtures for Argo CD, ESO, OpenTelemetry, W3C Trace Context, and Google Prometheus Engine rules
- [x] 10.4 Add deliberate Argo, ParentBased, and PodMonitoring mutations that the source contracts must reject
- [x] 10.5 Add deterministic, fingerprinted replay export and strict import validation
- [x] 10.6 Keep imported replays observation-only so they cannot update attempts or mastery
- [x] 10.7 Display fidelity and pinned provenance in the catalog and shared runner

## 11. Configuration Build Mode

- [x] 11.1 Add a shared typed configuration-challenge contract with files, delivery requirements, stable repair slots, hints, and evidence
- [x] 11.2 Add a GitOps capstone covering protected release promotion, manual production sync, ESO ordering, Secret joining, and Job bounds
- [x] 11.3 Add a tracing capstone covering W3C propagation, ParentBased sampling, OTLP export, Collector reception, batching, and Google Cloud export
- [x] 11.4 Add a metrics capstone covering Pod labels, PodMonitoring selection, named ports, scrape settings, and PromQL verification
- [x] 11.5 Add the shared responsive configuration workshop with multiple files, repair feedback, reset, and validation evidence
- [x] 11.6 Persist verified configuration files and invalidate the gate when a verified file changes
- [x] 11.7 Require configuration validation before authenticated explanation grading
- [x] 11.8 Prove every starter fails, every repaired fixture passes, and a one-line mutation fails the exact contract
- [x] 11.9 Reuse a verified build across scenarios of the same lab version without carrying it across definition changes
