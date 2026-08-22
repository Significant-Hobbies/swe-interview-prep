# systems-simulation-labs Specification

## Purpose
TBD - created by archiving change add-systems-simulation-labs. Update Purpose after archive.
## Requirements
### Requirement: Systems Lab catalog and routes
The system SHALL expose a Systems Lab catalog at `/labs` and a stable runner
route at `/labs/:labId`. Each catalog entry SHALL identify its concepts,
learning objective, estimated interaction time, and available scenarios.

#### Scenario: Learner opens the catalog
- **WHEN** a learner visits `/labs`
- **THEN** the system lists every published lab and links each entry to its stable runner route

#### Scenario: Learner follows a contextual entry point
- **WHEN** a learner opens a lab from a related Learn, concept, or Build surface
- **THEN** the same canonical `/labs/:labId` runner opens without renaming an existing route or primary navigation item

### Requirement: Disconnected deterministic simulation
Every lab SHALL run entirely in the browser from checked-in typed definitions
and a pure deterministic transition engine. A simulation MUST NOT call cloud,
Kubernetes, Git, telemetry, database, local-machine, or production APIs.

#### Scenario: Identical inputs are replayed
- **WHEN** the same lab version, controls, and actions are supplied twice
- **THEN** the engine produces byte-equivalent ordered states and evidence

#### Scenario: Learner is offline
- **WHEN** the application shell and lab assets are available but the network is unavailable
- **THEN** running, stepping, resetting, and inspecting a lab continue to work

### Requirement: Explicit truth planes
The lab runner SHALL display the independent state planes necessary to explain
the system, including resource state, controller or process action, operation
state, user-visible status, and emitted evidence where applicable. It MUST NOT
collapse a misleading healthy badge and a failed operation into one status.

#### Scenario: Migration hook fails
- **WHEN** a migration Job exhausts its configured retries
- **THEN** the runner can simultaneously show the previous workloads available, application health healthy, sync incomplete, and the hook operation failed

#### Scenario: Evidence is inspected
- **WHEN** the learner selects a state or timeline event
- **THEN** the runner shows the exact synthetic evidence that supports that state and identifies which simulated actor owns it

### Requirement: Learner-controlled execution
The runner SHALL support reset, single-step, run-to-next-decision, and complete
execution. Controls that alter behavior SHALL be chosen before execution and
their values SHALL remain visible while evidence is inspected.

#### Scenario: Learner steps through asynchronous reconciliation
- **WHEN** the learner advances a delayed secret-reconciliation scenario one step at a time
- **THEN** each ESO observation, Secret write, Argo wait, and downstream unblock appears in causal order

#### Scenario: Learner resets a run
- **WHEN** the learner resets the lab
- **THEN** all runtime state returns to the initial definition while the selected lab and scenario remain available

### Requirement: GitOps and migration lab
The first release SHALL include a lab modeling Git revision selection, Argo CD
comparison and sync, ExternalSecret application, asynchronous ESO
reconciliation, migration hook execution, Kubernetes Job retries, and workload
rollout.

#### Scenario: Healthy ordered deployment
- **WHEN** the Secret reconciles and the migration succeeds
- **THEN** the lab orders ExternalSecret wave -2, migration wave -1, and workloads wave 0 and produces evidence for the resulting database revision

#### Scenario: Secret reconciliation is delayed
- **WHEN** ESO has not produced the target Secret
- **THEN** the lab shows Argo waiting on health without claiming that Argo fetched the secret itself

#### Scenario: Migration fails after partial work
- **WHEN** the migration performs one schema action and then exits non-zero until backoff is exhausted
- **THEN** the lab preserves the partial database evidence, blocks the new workload revision, and exposes the failed hook independently from application health

#### Scenario: Revision contains only a hook change
- **WHEN** a Git revision changes only a hook resource excluded from ordinary resource tracking
- **THEN** the lab demonstrates why a normal diff can remain Synced and distinguishes the additional non-hook change needed to trigger the teaching scenario

### Requirement: Trace propagation and sampling lab
The first release SHALL include a lab modeling header extraction, remote parent
creation, ParentBased branch selection, root or ratio sampler evaluation,
recording state, and Collector export.

#### Scenario: Remote unsampled parent uses default ParentBased behavior
- **WHEN** the propagator extracts a valid remote unsampled parent and the default ParentBased policy is selected
- **THEN** the lab drops the server span before consulting the root ratio and emits no Collector trace

#### Scenario: Edge policy overrides remote flags
- **WHEN** the same remote unsampled parent reaches a policy that routes both remote-parent branches through the configured ratio
- **THEN** the ratio determines the result and a sampled span produces Collector evidence

#### Scenario: Learner changes only the root ratio
- **WHEN** the learner raises the root ratio while retaining the default remote-unsampled ParentBased branch
- **THEN** the outcome remains dropped and the lab explains that the ratio was not consulted

### Requirement: Metrics discovery and ingestion lab
The first release SHALL include a lab modeling endpoint exposure, workload
labels, PodMonitoring selection, target discovery, scraping, storage, and query
results as independent gates.

#### Scenario: Endpoint and selector succeed
- **WHEN** the process exposes metrics, the selector matches, and the scrape succeeds
- **THEN** the lab produces a stored synthetic series and a non-empty query result

#### Scenario: Selector matches no workloads
- **WHEN** the endpoint returns successfully but PodMonitoring selects zero Pods
- **THEN** the lab shows the valid manifest and working endpoint while discovery, storage, and query evidence fail

#### Scenario: Discovered endpoint cannot be scraped
- **WHEN** PodMonitoring selects a Pod but its named port or metrics response is invalid
- **THEN** the lab shows a discovered target with a scrape failure and no stored series

### Requirement: Extensible checked-in lab definitions
Adding a lab SHALL require a checked-in definition, concept mapping, scenarios,
evidence assertions, and tests, without adding a new page component or
modifying the simulation engine.

#### Scenario: Author adds a fourth lab
- **WHEN** a valid new lab definition is registered
- **THEN** it appears in the catalog and runs through the shared runner without route or engine changes

#### Scenario: Definition has invalid references
- **WHEN** a lab references an unknown concept, duplicate state, missing target, or unreachable expected outcome
- **THEN** static validation or tests fail before the application build is considered valid

### Requirement: Accessible responsive lab interaction
The lab catalog and runner SHALL support keyboard operation, visible focus,
semantic status announcements, reduced motion, and layouts at 390, 768, and
1440 pixels without hiding evidence required to complete a lab.

#### Scenario: Learner uses a compact viewport
- **WHEN** the runner is opened at 390 pixels wide
- **THEN** controls, current state, evidence, and learning checks remain reachable without horizontal page scrolling

#### Scenario: Learner uses keyboard controls
- **WHEN** the learner navigates and executes a lab without a pointer
- **THEN** every control is operable in logical order and state changes are announced without relying on color alone

### Requirement: Source-grounded fidelity
Every published lab SHALL declare whether it is modeled, source-verified, or
oracle-verified. A verification claim SHALL identify immutable upstream
revisions, reviewed paths, license, method, and verification date. The system
MUST NOT label a lab oracle-verified without an executable upstream oracle.

#### Scenario: Upstream rule is reversed locally
- **WHEN** a mutation reverses a source-verified Argo, tracing, or metrics rule
- **THEN** a checked-in source contract fails with the expected and actual observable value

#### Scenario: Learner inspects fidelity
- **WHEN** the learner opens the catalog or runner
- **THEN** the fidelity level is visible and the runner links to the exact pinned upstream source

### Requirement: Versioned deterministic replays
The runner SHALL export and import a versioned replay containing only lab
identity, definition version, scenario, ordered simulation actions, and a
final-state fingerprint. Import SHALL fail closed for malformed actions,
unknown labs or scenarios, stale definitions, and fingerprint mismatches.

#### Scenario: Replay is shared
- **WHEN** the same replay is loaded against the same lab definition
- **THEN** it produces the same final snapshot and evidence without a network request

#### Scenario: Imported replay completes
- **WHEN** an imported replay reaches a terminal outcome
- **THEN** it remains observation-only and cannot complete an attempt, grade an explanation, or update mastery

### Requirement: Configuration Build mode
Every initial lab SHALL provide a bounded, editable infrastructure
configuration that starts broken. The learner SHALL receive a visible delivery
brief and causal validation hints, but the validator MUST NOT reveal the
replacement line for a failed check. The same shared workshop SHALL support all
three labs without executing configuration or contacting infrastructure.

#### Scenario: Learner repairs GitOps setup
- **WHEN** the learner configures a protected production release reference, explicit promotion gate, ESO and migration waves, matching Secret references, and bounded Job behavior
- **THEN** every GitOps setup contract passes and produces configuration evidence

#### Scenario: Learner repairs tracing setup
- **WHEN** the learner connects W3C propagation, ParentBased sampling, OTLP export, Collector reception, batching, and Google Cloud export
- **THEN** every tracing setup contract passes and produces configuration evidence

#### Scenario: Learner repairs metrics setup
- **WHEN** the learner joins Pod labels to PodMonitoring, resolves the named port, selects the metrics path and interval, and writes the verification query
- **THEN** every metrics setup contract passes and produces configuration evidence

#### Scenario: Verified configuration changes
- **WHEN** a learner edits or resets a configuration after it passed
- **THEN** the setup gate is invalidated until every check passes again

#### Scenario: Learner changes counterfactual
- **WHEN** a configuration passed and the learner starts another scenario from the same lab definition version
- **THEN** the verified files and setup evidence are reused without carrying them into a different definition version

#### Scenario: Learner requests explanation grading
- **WHEN** the simulation is complete but the configuration challenge has not passed
- **THEN** authenticated explanation grading and mastery application remain unavailable
