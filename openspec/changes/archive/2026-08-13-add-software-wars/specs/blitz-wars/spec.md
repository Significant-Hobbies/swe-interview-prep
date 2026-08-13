## Purpose

Defines fast objective engineering battles that produce trustworthy competitive outcomes and immediate evidence about a learner's technical gaps.

## ADDED Requirements

### Requirement: Blitz battle creation
The system SHALL let an authenticated user start a 60–120 second Blitz battle containing 5–10 versioned objective questions from the canonical Learning OS curriculum. A user SHALL be able to choose Ranked Mix or an unranked track, roadmap, or concept practice queue; only Ranked Mix SHALL affect global Blitz rating.

#### Scenario: Start a ranked mixed battle
- **WHEN** an authenticated user selects Ranked Mix and presses Play
- **THEN** the system creates a server-owned match snapshot, selects an eligible opponent and immutable question versions, and returns question stems and shuffled options without answer keys

#### Scenario: Start a scoped curriculum battle
- **WHEN** an authenticated user selects a canonical track, roadmap, or concept
- **THEN** the server derives eligible active questions from canonical concept relationships, starts an unranked battle restricted to that scope, and labels the result as unranked

#### Scenario: Selected scope has insufficient active questions
- **WHEN** a visible track, roadmap, or concept queue has fewer than five active questions
- **THEN** the catalogue shows its candidate and active counts and prevents starting a misleading battle while preserving links to the corresponding learning surface

#### Scenario: Guest starts Blitz
- **WHEN** a visitor without an account presses Play
- **THEN** the system starts a complete unranked browser battle immediately, labels its state as local to that browser, and does not create Elo, FSRS evidence, public history, or a server-owned attempt

#### Scenario: Guest requests a durable competitive feature
- **WHEN** a guest requests ranked rating, history, result sharing, or a human challenge
- **THEN** the system explains that signup upgrades persistence and competitive identity while keeping unranked Blitz playable without signup

### Requirement: Server-authoritative attempt timing
The system MUST record match and answer deadlines on the server, reject answers submitted after the applicable deadline, and use server receipt times for scoring. Client countdowns SHALL be presentational only.

#### Scenario: Answer arrives before deadline
- **WHEN** the server receives a valid answer before the match deadline
- **THEN** it records the selected option, correctness evidence, and elapsed server time exactly once

#### Scenario: Answer arrives after deadline
- **WHEN** an answer reaches the server after the match deadline
- **THEN** the system rejects it as late and finalizes the unanswered question as incorrect

#### Scenario: Duplicate answer submission
- **WHEN** the same answer operation is retried with the same idempotency key
- **THEN** the system returns the original recorded answer without changing match state

### Requirement: Deterministic Blitz scoring
The system SHALL rank opponents lexicographically by total correct answers and then by total server-recorded response time across correct answers. Equal accuracy and equal qualifying response time SHALL produce a draw.

#### Scenario: Accuracy differs
- **WHEN** one opponent answers more questions correctly
- **THEN** that opponent wins regardless of response time

#### Scenario: Accuracy ties
- **WHEN** opponents have equal correct counts
- **THEN** the opponent with the lower total response time for correct answers wins

#### Scenario: AI opponent is scored
- **WHEN** a human plays a precomputed AI opponent
- **THEN** the AI's stored correctness participates in scoring and its response time is excluded from the tie-breaker

### Requirement: Supported opponent types
The system SHALL support versioned precomputed AI opponents, one-use ranked asynchronous human ghosts, and authenticated challenge-link opponents. A ranked human attempt MUST affect its owner at most once.

#### Scenario: Match against AI
- **WHEN** no eligible human ghost is available or the player selects an AI opponent
- **THEN** the system selects a compatible versioned AI profile immediately

#### Scenario: Ranked ghost is paired
- **WHEN** a completed unpaired human attempt matches a later player's rating band and question-set policy
- **THEN** the system pairs it once, finalizes both players' outcome once, and marks that ghost attempt consumed for ranked play

#### Scenario: Challenge is accepted
- **WHEN** an authenticated recipient opens a valid unused challenge link
- **THEN** the system gives the recipient the same immutable question versions under the same timing policy and finalizes the challenge after completion

### Requirement: Result, history, rematch, and sharing
The system SHALL show each completed match's outcome, score, rating delta when ranked, opponent identity class, mistake count, and remediation actions. It SHALL support rematch, match history, and a shareable result that does not reveal ranked question content.

#### Scenario: Match completes
- **WHEN** both sides have completed or the active side's deadline expires
- **THEN** the system finalizes one immutable result and shows Win, Loss, or Draw with supporting scoring evidence

#### Scenario: User requests rematch
- **WHEN** a player selects Rematch from a completed result
- **THEN** the system creates a new match with a fresh eligible question set and preserves the previous result

#### Scenario: Public result is shared
- **WHEN** a visitor opens a shareable result link
- **THEN** the system shows sanitized participants, outcome, scores, mode, rating movement, and aggregate topic signals without stems, options, answers, or explanations

### Requirement: Abandonment and reconnect behavior
The system SHALL allow an in-progress client to recover its server-owned attempt until the deadline and SHALL finalize expired or abandoned ranked attempts consistently.

#### Scenario: Browser reconnects
- **WHEN** the same authenticated player reloads before the deadline
- **THEN** the system restores recorded answers and the authoritative remaining time

#### Scenario: Ranked player abandons
- **WHEN** a ranked match expires with unanswered questions
- **THEN** unanswered questions count as incorrect and the result finalizes under the normal scoring policy
