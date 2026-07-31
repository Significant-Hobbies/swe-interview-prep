# simulation-mastery-loop Specification

## Purpose
TBD - created by archiving change add-systems-simulation-labs. Update Purpose after archive.
## Requirements
### Requirement: Prediction precedes observation
Every scored simulation attempt SHALL capture the learner's prediction before
revealing the final state or decisive evidence. Changing a prediction after
revelation MUST start a new attempt.

#### Scenario: Learner starts a scored run
- **WHEN** the learner selects a scenario and submits a prediction
- **THEN** the prediction is frozen for that attempt and execution controls become available

#### Scenario: Learner explores without scoring
- **WHEN** the learner chooses free exploration
- **THEN** all simulation controls remain available but the run cannot grant concept mastery

### Requirement: Outcome comparison uses evidence
After execution, the system SHALL compare the frozen prediction with the
deterministic outcome and require the learner to identify decisive synthetic
evidence. A correct final-state guess without correct evidence MUST NOT count
as a fully successful attempt.

#### Scenario: Correct prediction cites wrong authority
- **WHEN** the learner predicts a failed migration but selects application health instead of hook operation evidence
- **THEN** the system marks the evidence checkpoint incorrect and explains which actor owns the decisive state

#### Scenario: Prediction and evidence are correct
- **WHEN** the prediction matches the outcome and the learner identifies the decisive evidence
- **THEN** the attempt becomes eligible for explain-back and mastery evaluation

### Requirement: Explain-back closes the lab
An eligible attempt SHALL end with a concise explain-back prompt grounded in
the chosen scenario, prediction, outcome, and evidence. The prompt SHALL ask
for causality rather than a restatement of labels.

#### Scenario: Learner completes an explain-back
- **WHEN** the learner explains why the observed state followed from the inputs and evidence
- **THEN** the explanation is associated with the lab attempt and mapped concept IDs

#### Scenario: Learner skips explain-back
- **WHEN** the learner skips or abandons the explanation
- **THEN** the run remains available in exploration history but grants no mastery credit

### Requirement: Mastery requires demonstrated evidence
The system MUST NOT update FSRS mastery merely because a learner opened,
completed, or clicked through a lab. It SHALL derive mastery credit only from
the objective prediction/evidence result and an accepted explain-back path.

#### Scenario: Unscored exploration completes
- **WHEN** a learner reaches the final state in free exploration
- **THEN** no concept mastery update occurs

#### Scenario: Objective checkpoints fail
- **WHEN** the prediction or decisive-evidence checkpoint is incorrect
- **THEN** linked concepts receive no positive mastery rating and the learner can retry with the misconception exposed

#### Scenario: Authenticated Feynman grade succeeds
- **WHEN** an authenticated learner passes the objective checkpoints and the existing Feynman grading path accepts the explanation
- **THEN** the resulting ratings update the existing linked-concept FSRS records without introducing a second mastery store

#### Scenario: Guest completes the objective path
- **WHEN** a guest passes the prediction and decisive-evidence checkpoints but cannot use authenticated Feynman grading
- **THEN** the system preserves the completed attempt locally, clearly labels mastery as pending explain-back grading, and does not fabricate a positive rating

### Requirement: Existing learning state conventions
Simulation attempts SHALL follow existing per-account guest storage and guest
adoption conventions. The first release SHALL NOT add a database table, API
action, or alternate spaced-repetition implementation.

#### Scenario: Guest changes account context
- **WHEN** simulation attempt state is loaded for a different local account namespace
- **THEN** attempts from the previous account are not exposed

#### Scenario: Signed-in mastery is updated
- **WHEN** an accepted simulation explain-back produces concept ratings
- **THEN** the existing concept mastery API and scheduler remain the sole durable mastery authority

### Requirement: Retry preserves learning evidence
The learner SHALL be able to retry a failed attempt with the same controls,
while the UI distinguishes the new prediction from previously revealed
evidence.

#### Scenario: Learner retries a misconception
- **WHEN** a learner starts a retry after reviewing the decisive evidence
- **THEN** the new attempt requires a fresh prediction and does not present the previous answer as an editable prediction

#### Scenario: Learner later succeeds
- **WHEN** a later scored attempt passes prediction, evidence, and explain-back evaluation
- **THEN** only the successful attempt becomes eligible for positive mastery credit
