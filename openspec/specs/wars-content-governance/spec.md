# wars-content-governance Specification

## Purpose
Defines the editorial and versioning contract that keeps ranked Software Wars content defensible, source-backed, stable during matches, and safe to retire.
## Requirements
### Requirement: Versioned ranked question contract
Every ranked Blitz question SHALL have an immutable question ID and version, a distinct stable `contentKey`, one defensible correct answer, authored distractors, an authored explanation for the correct option and every distractor, exactly one canonical primary Learning OS concept ID, zero or more canonical supporting concept IDs, difficulty, primary or authoritative sources, and editorial status. Code may appear in a question stem, but Blitz answer choices SHALL remain concise text rather than competing code blocks.

#### Scenario: Active question is selected
- **WHEN** ranked matchmaking selects a question
- **THEN** it snapshots the exact active version and never substitutes later edits into that match

#### Scenario: Question lacks required evidence
- **WHEN** a question has no authoritative source, no mapped concept, multiple defensible answers, any option lacks an explanation, or it duplicates or closely paraphrases another active base question
- **THEN** the content validator rejects it from the ranked pool

#### Scenario: Result explains every option
- **WHEN** a player completes an attempted question
- **THEN** the result can show why the selected option was right or wrong and why every alternative does not satisfy the question

#### Scenario: Question maps to learning
- **WHEN** a question is validated or returned in an authorized result
- **THEN** its primary concept resolves to `/concepts/:id`, and its track and roadmap memberships are derived from the canonical curriculum rather than copied into Wars metadata

### Requirement: Server-only answer material
Correct options, explanations, variant parameters that reveal answers, AI precomputed answers, and Tradeoff evaluation rubrics MUST remain outside the browser bundle and SHALL be returned only after authorization and the relevant match phase permits disclosure.

#### Scenario: Active Blitz match loads
- **WHEN** the client requests its question set
- **THEN** the response contains only display-safe stems, options, metadata, and opaque version identifiers

#### Scenario: Match completes
- **WHEN** a player's result is finalized
- **THEN** the server may return authored explanations for questions that player attempted without making the full ranked bank public

### Requirement: Editorial lifecycle
Content SHALL move through draft, reviewed, active, and retired states. Only reviewed active content SHALL appear in ranked matches. Retirement SHALL prevent new selection without rewriting completed match history.

#### Scenario: Editor activates reviewed content
- **WHEN** a complete item passes deterministic validation and receives reviewed status
- **THEN** it becomes eligible for a separately controlled activation step

#### Scenario: Active item is retired
- **WHEN** an editor retires an ambiguous or obsolete item
- **THEN** no new ranked match selects it and existing matches retain their immutable snapshot

### Requirement: Ambiguity reporting and correction
Participants SHALL be able to report a ranked item with a reason. Operators SHALL be able to inspect reports, retire the affected version, and void rating effects for materially invalid results without deleting match evidence.

#### Scenario: Player reports a question
- **WHEN** a participant submits an ambiguity report from a completed result
- **THEN** the system records the item version, match, reporter, reason, and review state without changing the result immediately

#### Scenario: Operator voids invalid results
- **WHEN** an operator confirms a material content defect
- **THEN** the system retires the item version and records compensating rating events for affected matches according to the current correction policy

### Requirement: Parameterized variants
Parameterized variants SHALL use deterministic generators with validated parameter domains and stable generated version identifiers. A generator MUST NOT create a ranked variant whose answer or explanation has not been mechanically verified. Variants SHALL be reported separately and MUST NOT increase the distinct authored-question count.

#### Scenario: Variant is generated
- **WHEN** matchmaking requests an eligible parameterized item
- **THEN** the server derives the stem, options, correct answer, explanation values, and version identifier from one validated parameter seed

#### Scenario: Generated variant fails validation
- **WHEN** the generator produces duplicate options, an invalid answer, or an unsupported parameter combination
- **THEN** the server discards it and selects another eligible item

### Requirement: Precomputed AI opponent snapshots
Each AI opponent SHALL identify provider/model name, model version or snapshot date, benchmark run version, answer per question version, explanation, aggregate accuracy, and fixed published rating. Ranked matches MUST NOT invoke the AI opponent at match time.

#### Scenario: AI opponent is selected
- **WHEN** matchmaking chooses an AI profile
- **THEN** scoring uses the stored answer for every selected question version and performs no model inference for opponent play

#### Scenario: Model version changes
- **WHEN** an operator benchmarks a new model version
- **THEN** the system creates a new opponent snapshot without rewriting the old profile or its completed matches

### Requirement: Launch content threshold
Public ranked Blitz launch SHALL require the configured reviewed active question depth across all canonical concepts eligible for Blitz, explanations for every option, balanced difficulty coverage, and complete precomputed AI answer coverage. Every canonical track, roadmap, and concept SHALL remain discoverable before it reaches ranked depth, with candidate and active counts reported separately. Tradeoff ranked launch SHALL require at least 20 reviewed problems with twists and evaluation rubrics.

#### Scenario: Pool is below threshold
- **WHEN** a deployment has fewer than the required reviewed active items
- **THEN** it may run development and unranked preview matches but SHALL label ranked public launch as unavailable

#### Scenario: Pool meets threshold
- **WHEN** deterministic content validation confirms the required counts and coverage
- **THEN** the deployment becomes eligible for operator-controlled ranked activation

### Requirement: Base-question and variant reporting
Content reports SHALL publish distinct authored-question counts separately from generated playable variants and SHALL include topic, difficulty, concept, explanation, source, and AI coverage.
Content reports SHALL also publish canonical track, roadmap, and concept coverage, including zero-coverage curriculum entries.

#### Scenario: One base question has multiple parameter seeds
- **WHEN** the validator reports the ranked bank
- **THEN** that family contributes one distinct authored question and its generated versions contribute only to the separate playable-variant count

