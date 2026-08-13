## Purpose

Completes interactive coverage of the recurring classic system-design archetypes that are not yet represented as first-class, rubric-backed practice cases.

## ADDED Requirements

### Requirement: Thirteen missing classic cases are first-class practice
The system SHALL add exactly these stable case IDs: `distributed-unique-id-generator`, `proximity-search-service`, `nearby-friends-service`, `maps-routing-platform`, `distributed-message-queue`, `metrics-monitoring-platform`, `ad-click-aggregation-system`, `hotel-reservation-system`, `distributed-email-service`, `object-storage-service`, `gaming-leaderboard`, `digital-wallet-system`, and `stock-exchange`.

Each case SHALL satisfy the canonical six-stage system-design schema and remain available in the existing solo and shared Playground practice flow.

#### Scenario: Catalog accepts the complete gap batch
- **WHEN** system-design catalog integrity runs
- **THEN** all thirteen case IDs are present exactly once and every concept and drill reference resolves

#### Scenario: Learner selects a new case
- **WHEN** the learner starts any new case
- **THEN** the existing scoping, estimation, high-level design, deep-dive, failure, and review stages apply without a special session implementation

### Requirement: Each case teaches a reusable systems pattern
Every new case SHALL identify a distinct reusable pattern, critical path, quantitative capacity anchor with units, deterministic follow-up, injected failure, stronger answer, and at least two primary or official sources.

#### Scenario: Learner reviews a completed case
- **WHEN** the attempt reaches review
- **THEN** the learner sees the protected invariant, key trade-off, capacity reasoning, failure-recovery signals, common mistakes, and linked remediation

### Requirement: Similar products remain distinct through invariants
The proximity, nearby-friends, and maps cases SHALL test different invariants; the payment and wallet cases SHALL test different ledger boundaries; and the queue, notification, and email cases SHALL test different delivery contracts.

#### Scenario: Catalog is checked for renamed duplicates
- **WHEN** the new cases are compared with the existing case inventory
- **THEN** each exposes a distinct critical path and reusable pattern rather than a product-name variation of an existing case

### Requirement: All cases link to canonical learning material
Every new case SHALL reference existing or newly authored canonical concepts and editorial drills so weak rubric dimensions route to a Learn page and an executable Practice activity.

#### Scenario: Rubric identifies a weak dimension
- **WHEN** a learner scores below mastery on requirements, capacity, architecture, technical judgment, or reliability
- **THEN** each weak dimension resolves to at least one valid concept and one valid drill

### Requirement: Existing system-design state remains compatible
Adding the cases SHALL NOT change existing case IDs, versions, local attempt keys, rubric semantics, or answer-visibility behavior.

#### Scenario: Existing attempt resumes after expansion
- **WHEN** a learner reopens a saved attempt for any pre-existing case
- **THEN** it resolves against the same case definition and stage state without migration or data loss

