## ADDED Requirements

### Requirement: Triage covers the catalog and is resumable
A learner SHALL be able to rate every concept Known, Fuzzy, or New, scoped to
one domain or to the whole catalog, and resume a partial pass without losing
or repeating work.

#### Scenario: A pass is interrupted
- **WHEN** a learner rates part of a domain and returns later
- **THEN** already-rated concepts are absent from the queue and the remainder is unchanged

#### Scenario: A domain is finished
- **WHEN** every concept in the scope has been rated
- **THEN** the surface reports completion and offers the review queue and another domain

### Requirement: Only gaps enter the review queue
Concepts rated Known MUST NOT seed review cards. Concepts rated Fuzzy or New
SHALL seed the concept's unseen editorial review questions.

#### Scenario: A known concept is rated
- **WHEN** a learner marks a concept Known
- **THEN** concept mastery is recorded and no review card is created for it

#### Scenario: A card already has scheduling history
- **WHEN** a concept is rated and one of its review questions has been seen before
- **THEN** that question is not re-seeded and its existing schedule is preserved

### Requirement: A rating is committed only once its writes land
The surface MUST NOT mark a concept triaged when the writes it implies were
rejected, and SHALL tell the learner the rating was not recorded.

#### Scenario: The session has expired mid-pass
- **WHEN** a rating's mastery write is rejected by the server
- **THEN** the concept stays in the queue, nothing is recorded, and the failure is shown

### Requirement: Rating input cannot fire unintentionally
Rating shortcuts SHALL be active only on the rating surface, MUST ignore key
auto-repeat, and MUST ignore keys pressed while a text input, select, or
editable element has focus.

#### Scenario: A key is held down
- **WHEN** a learner holds a rating key
- **THEN** exactly one concept is rated

#### Scenario: A shortcut key is pressed away from the rating surface
- **WHEN** a learner presses a rating key on the domain picker
- **THEN** nothing is rated and no mastery is written

### Requirement: Triage is private to one learner
Sweep state SHALL be scoped per account. Signing in SHALL adopt a guest pass
rather than discard it, and MUST NOT leave that pass available to a later
account on the same browser.

#### Scenario: A second account signs in on a shared browser
- **WHEN** a different account opens the surface after another has swept
- **THEN** it starts from an untriaged queue

### Requirement: Domains are ranked by remaining gaps a learner cares about
Domains SHALL be ordered by the gaps the app can close, excluding domains the
learner has muted, and MUST indicate when a domain's figure is an untriaged
upper bound rather than a measurement.

#### Scenario: A domain has not been triaged
- **WHEN** no concept in the top-ranked domain has been rated
- **THEN** the surface states that the figure is an upper bound

#### Scenario: A domain is muted
- **WHEN** a learner marks a domain as not of interest
- **THEN** it is absent from the ranking and the choice survives signing in

### Requirement: Outside sources are named only when they genuinely cover the gap
A source SHALL be recommended for a domain only when it covers a meaningful
share of that domain's remaining gaps, and the link MUST resolve to the work
named rather than to one part of it. When no source qualifies, the surface
SHALL say so.

#### Scenario: A source overlaps incidentally
- **WHEN** a broad source covers a few concepts of a large domain by coincidence
- **THEN** it is not recommended and the domain reports no hub

#### Scenario: A domain is nearly finished
- **WHEN** only a few gaps remain and one source covers them
- **THEN** that source is still recommended

## Deferred Requirements

### Requirement: Triage syncs across devices
Sweep state SHOULD reconcile through the server so a pass is visible on every
device for that account. Not implemented — see `design.md`; it requires an
additive schema change and a new API action.

#### Scenario: A pass is started on another device
- **WHEN** a learner sweeps on one machine and opens the surface on another
- **THEN** the triaged concepts are absent from the queue and coverage matches
