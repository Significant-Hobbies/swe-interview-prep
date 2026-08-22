# wars-learning-loop Specification

## Purpose
Defines how competitive evidence becomes targeted learning and spaced repetition without turning recognition or AI answers into fabricated mastery.
## Requirements
### Requirement: Post-Blitz mistake explanation
After a Blitz attempt is final, the system SHALL show the player's answer, the authored correct answer, a source-backed explanation, mapped concepts, and relevant lesson or drill for every incorrect response. It MUST NOT expose this material during the active attempt.

#### Scenario: Player answers incorrectly
- **WHEN** the completed result contains an incorrect answer
- **THEN** the result shows the authored explanation, authoritative sources, concept link, Learn action, Drill action, and Add to Review state

#### Scenario: Player follows Learn
- **WHEN** the player selects Learn from a question or weakness card
- **THEN** navigation opens the canonical primary concept at `/concepts/:id` rather than the general Learn catalogue

#### Scenario: Active match requests explanation
- **WHEN** a client requests answer material before its attempt is final
- **THEN** the server refuses disclosure

### Requirement: Conservative FSRS remediation
An authenticated Blitz mistake SHALL schedule mapped concepts with `again` or `hard` evidence according to the documented mistake policy. A correct MCQ response MUST NOT produce `good` or `easy` concept mastery by itself. Tradeoff artifact evaluation MAY produce `again`, `hard`, or `good` ratings when the rubric contains inspectable concept evidence, but SHALL never produce `easy` automatically.

#### Scenario: Incorrect Blitz answer is finalized
- **WHEN** a mapped question is incorrect
- **THEN** the system writes at most one idempotent remediation event per concept and match and updates the existing authenticated FSRS scheduler conservatively

#### Scenario: Correct Blitz answer is finalized
- **WHEN** a mapped question is correct
- **THEN** the system records diagnostic success without granting positive FSRS mastery

#### Scenario: Tradeoff artifact demonstrates concept evidence
- **WHEN** a finalized structured rubric explicitly identifies strong inspectable evidence for a mapped concept
- **THEN** the system may apply at most a `good` FSRS rating and records the evidence source with the remediation event

### Requirement: Weakness summary and recommendations
Every completed battle SHALL aggregate relevant concept evidence into weakness cards containing accuracy or rubric evidence, current mastery context, and direct Learn, Drill, and Review actions.

#### Scenario: Multiple questions map to one weak concept
- **WHEN** a player misses multiple items mapped to the same concept
- **THEN** the result presents one aggregated weakness card with match accuracy and one set of learning actions

#### Scenario: No weakness is detected
- **WHEN** no negative concept evidence exists
- **THEN** the result presents verified strengths and a rematch action without fabricating a weakness

### Requirement: Variant resurfacing and improvement evidence
The system SHALL prioritize unseen or materially different variants of previously failed concepts in later eligible battles until diagnostic performance improves. It SHALL preserve a before-and-after evidence trail.

#### Scenario: Failed concept reappears
- **WHEN** a player starts a later eligible match while a failed concept remains weak
- **THEN** selection weighting may include an unseen validated variant without repeating the exact exposed item inside its cooldown window

#### Scenario: Performance improves
- **WHEN** the player later answers a valid variant correctly or demonstrates the concept in a Tradeoff artifact
- **THEN** the system records improvement evidence and shows the comparison without automatically declaring mastery from a single MCQ

### Requirement: Socratic boundary remains intact
Authored post-match explanations and structured adjudication feedback SHALL be separate from the Socratic companion. The active Companion and chat prompt MUST continue to probe reasoning without supplying direct solutions.

#### Scenario: Player asks Companion for an active answer
- **WHEN** the Socratic companion receives a request for an answer during a battle
- **THEN** it continues to ask probing questions and does not reveal ranked answers, rubrics, twists, or reference solutions

