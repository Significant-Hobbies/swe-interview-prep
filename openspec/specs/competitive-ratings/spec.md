# competitive-ratings Specification

## Purpose
Defines trustworthy, server-owned competitive ratings and leaderboards that remain comparable across Software Wars modes and opponent types.
## Requirements
### Requirement: Separate mode ratings
The system SHALL maintain independent Blitz and Tradeoff ratings for each authenticated user. A result in one mode MUST NOT modify the other mode's rating.

#### Scenario: Blitz result finalizes
- **WHEN** a ranked Blitz result is finalized
- **THEN** only the participating users' Blitz rating state and Blitz rating events are eligible to change

#### Scenario: Tradeoff result finalizes
- **WHEN** a ranked Tradeoff result is finalized
- **THEN** only the participating users' Tradeoff rating state and Tradeoff rating events are eligible to change

### Requirement: Provisional and established ratings
The system SHALL start each mode at rating 1500, label the first 10 finalized ranked matches as provisional, use a K-factor of 48 while provisional, and use a K-factor of 24 after establishment.

#### Scenario: New player completes first ranked match
- **WHEN** a user with no prior ranked result completes a match
- **THEN** the system computes the change from rating 1500 with provisional K-factor 48 and shows the rating as provisional

#### Scenario: Player completes eleventh ranked match
- **WHEN** a user with 10 prior finalized ranked matches completes another
- **THEN** the system computes the change with established K-factor 24 and removes the provisional label

### Requirement: Server-owned idempotent rating updates
Competitive rating input and calculation MUST remain server-owned. Finalizing the same match more than once MUST NOT create additional rating changes.

#### Scenario: Client supplies a rating value
- **WHEN** a client attempts to submit its own rating or rating delta
- **THEN** the server ignores or rejects that value and derives the update from immutable match evidence

#### Scenario: Finalization is retried
- **WHEN** match finalization runs again after rating events already exist
- **THEN** the system returns the existing result and rating events without changing either rating

### Requirement: Human and fixed AI rating behavior
Human-versus-human ranked outcomes SHALL update both participants once. Human-versus-AI outcomes SHALL update only the human against the AI profile's fixed versioned rating.

#### Scenario: Human ghost match finalizes
- **WHEN** two human attempts are paired and scored
- **THEN** the system produces reciprocal rating events from the rating snapshots stored with that pairing

#### Scenario: AI match finalizes
- **WHEN** a human completes a ranked match against an AI profile
- **THEN** the human receives one rating event and the AI profile's published rating remains unchanged

### Requirement: Mode-specific leaderboards
The system SHALL expose separate Blitz and Tradeoff leaderboards with established players ranked ahead of provisional players at equal rating. Public entries SHALL contain only display-safe profile data.

#### Scenario: User views Blitz leaderboard
- **WHEN** a visitor opens the Blitz leaderboard
- **THEN** the system returns Blitz rating, provisional status, ranked match count, win/draw/loss record, and display-safe identity without Tradeoff rating

#### Scenario: User opts out of public ranking
- **WHEN** an authenticated user disables public leaderboard visibility
- **THEN** the public leaderboard omits that user's identity while their private rating continues to function

### Requirement: Auditable rating history
Each competitive rating change SHALL be preserved as an immutable event containing mode, match, before value, after value, score, opponent class, opponent rating snapshot, algorithm version, and creation time.

#### Scenario: Rating history is inspected
- **WHEN** an authenticated user opens a completed ranked match
- **THEN** the system can explain the displayed delta from the associated immutable rating event

