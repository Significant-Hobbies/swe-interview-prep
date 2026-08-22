## Purpose

Provide repeatable system-design interview practice that measures the decisions a learner makes across a realistic interview, then turns specific weaknesses into targeted study and review.

## ADDED Requirements

### Requirement: Common cases are canonical and versioned
The system SHALL define each system-design case as versioned canonical data containing the prompt, interviewer-only assumptions, ordered stages, calculation anchors, rubric dimensions, deterministic follow-ups, failure injections, concept mappings, reference answer, and primary sources.

#### Scenario: First case library is loaded
- **WHEN** the system-design case catalog is validated
- **THEN** it contains LLM inference serving, production RAG, a multi-tenant LLM gateway, real-time recommendations, a URL shortener, a distributed rate limiter, real-time chat, and a ranked news feed with every required field

#### Scenario: An existing case changes materially
- **WHEN** an assumption, rubric anchor, or reference answer changes
- **THEN** the case version changes so a saved attempt remains interpretable against the version the learner used

### Requirement: Attempts follow deterministic interview stages
The system SHALL run each case through scoping, estimation, high-level design, deep dive, failure injection, and review in the case-defined order.

#### Scenario: Learner begins a case
- **WHEN** a learner starts a structured case
- **THEN** the session opens at scoping without exposing interviewer assumptions, later prompts, rubric anchors, or the reference answer

#### Scenario: Learner submits a stage
- **WHEN** the learner records an answer and advances
- **THEN** the session preserves that answer, advances according to the case definition, and cannot skip a required stage

#### Scenario: Learner resumes an unfinished attempt
- **WHEN** a compatible saved attempt exists for the same case and version
- **THEN** the system restores the current stage, elapsed state, and prior answers without revealing later-stage material

### Requirement: Scoping and capacity reasoning are evaluated explicitly
The system MUST distinguish requirement discovery and capacity estimation from later architecture prose.

#### Scenario: LLM inference assumptions are ambiguous
- **WHEN** the learner handles the 10,000-requests-per-second case
- **THEN** the scoping stage checks for model size, input and output token distributions, latency SLOs, streaming, traffic shape, availability, regions, and cost constraints before revealing case assumptions

#### Scenario: Learner estimates capacity
- **WHEN** the learner submits capacity math
- **THEN** evaluation checks units and reasoning for request rate, token rate, concurrency, measured per-replica throughput, headroom, and fleet sizing rather than requiring one universal GPU count

### Requirement: Follow-ups and failures are case-defined
The system SHALL select follow-ups and failure injections only from deterministic branches declared in the active case version.

#### Scenario: Learner chooses an architecture
- **WHEN** a declared decision activates a follow-up branch
- **THEN** the interviewer asks the corresponding case-authored follow-up and records which branch was used

#### Scenario: Failure stage begins
- **WHEN** the learner reaches failure injection
- **THEN** the system presents a case-authored incident such as a hot queue, regional loss, dependency slowdown, or burst and asks for detection, mitigation, degradation, and recovery

### Requirement: Grading is evidence-backed and resilient
The system SHALL score named rubric dimensions from answer evidence and SHALL retain deterministic grading when AI critique is absent or invalid.

#### Scenario: A dimension receives a score
- **WHEN** an attempt is reviewed
- **THEN** the result contains the dimension score, cited learner evidence or a missing-evidence explanation, and the applicable rubric anchor

#### Scenario: AI critique is configured
- **WHEN** AI grades or phrases feedback
- **THEN** its response is validated against the case schema and it cannot add assumptions, dimensions, canonical facts, or a score outside declared anchors

#### Scenario: AI critique is unavailable
- **WHEN** no provider is configured, a request fails, or a response is invalid
- **THEN** the learner can complete the attempt with deterministic rubric evidence and without losing saved work

### Requirement: Review produces targeted remediation
The system SHALL map each missed rubric dimension to its declared concept and drill targets instead of applying one aggregate rating to every concept in the case.

#### Scenario: Learner misses capacity math but handles reliability
- **WHEN** the completed attempt is reviewed
- **THEN** capacity-planning remediation is recommended while already-demonstrated reliability concepts are not downgraded by that miss

#### Scenario: Review is complete
- **WHEN** dimension results are available
- **THEN** the learner receives an overall readiness band, stronger answer, harder follow-ups, missed concepts, and direct links to targeted study and drills

### Requirement: Reference answers respect the Socratic boundary
The system MUST keep direct solutions hidden during active practice and SHALL reveal them only after submission or an explicit review action.

#### Scenario: Active learner asks for the answer
- **WHEN** the attempt is not submitted
- **THEN** the companion probes reasoning or offers a bounded hint without displaying the reference answer

#### Scenario: Learner enters review
- **WHEN** the attempt has been submitted or the learner explicitly abandons practice for review
- **THEN** the system may show the worked answer, calculation anchors, and comparison against the learner's evidence

### Requirement: Attempt persistence is private and migration-safe
The first release SHALL store structured attempts locally with case ID, case version, session schema version, stage state, answers, branch history, and results.

#### Scenario: Stored attempt has an unsupported schema
- **WHEN** the application cannot safely migrate a local attempt
- **THEN** it preserves the stored record, explains that it is read-only, and offers a new attempt without corrupting current mastery
