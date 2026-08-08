# Expanded Learning Domains

## Purpose

Define the durable curriculum contract for broad systems, AI-native,
developer-tooling, application-engineering, and multimodal learning coverage.

## Requirements

### Requirement: Requested taxonomy is completely mapped
The learning OS SHALL maintain a machine-readable coverage map for all eleven
requested categories and every named subtopic within them.

#### Scenario: Coverage map integrity
- **WHEN** curriculum integrity tests run
- **THEN** every requested subtopic has at least one existing concept ID and no mapping points to a missing concept

### Requirement: Missing domains are first-class tracks
The learning OS SHALL expose Systems Foundations, Infrastructure & Platforms,
Distributed Systems, Inference & Serving, Agent Systems, AI Reliability,
Developer Tools & Code Intelligence, Application Engineering, and Multimodal
& Spatial Computing as known tracks.

#### Scenario: User browses the full catalog
- **WHEN** the user opens the learning catalog
- **THEN** each added domain is available as a recognized track with at least three concepts

### Requirement: Existing learning state remains compatible
The expansion MUST preserve every existing track ID and concept ID.

#### Scenario: Existing learner returns after expansion
- **WHEN** previously stored mastery or FSRS state references an existing concept ID
- **THEN** the concept still resolves and its stored state remains usable

### Requirement: Concepts are practice-backed
Every newly introduced concept SHALL have a description, mental model,
canonical resource, editorial drill with an executable validation case, and
review question.

#### Scenario: New concept enters the practice loop
- **WHEN** a user opens any concept introduced by this change
- **THEN** the concept offers a linked practice drill and an explain-back review prompt

### Requirement: Each added track has a sequenced path
Every added track SHALL have a selectable roadmap that places all of its
concepts into ordered milestones and ends in a synthesis artifact.

#### Scenario: User selects a new domain
- **WHEN** the user chooses an added roadmap
- **THEN** the app can recommend its next concept and display a measurable capstone

### Requirement: AI model training is a coherent path
The existing AI Systems track SHALL offer a selectable roadmap covering model
foundations, pre-training, fine-tuning, post-training, reinforcement learning,
quantization, open-weight models, and evaluation.

#### Scenario: User studies model development end to end
- **WHEN** the user selects the AI Models & Training roadmap
- **THEN** concepts are ordered from architecture and optimization through training, alignment, compression, and evaluation

### Requirement: Existing concepts are reused without duplication
When an existing concept already satisfies a requested subtopic, the learning
OS SHALL reuse its stable ID and MAY change its primary track while retaining
its former domain as a secondary tag.

#### Scenario: Consensus moves into Distributed Systems
- **WHEN** the expanded taxonomy is loaded
- **THEN** the existing `consensus` concept appears under Distributed Systems without creating a duplicate consensus card

### Requirement: Curriculum navigation stays scannable
The learning page SHALL group the added roadmaps into clear systems, AI-native,
software-building, and human-interface families without hiding existing
roadmaps.

#### Scenario: User scans all learning paths
- **WHEN** the learning or explore page renders roadmap groups
- **THEN** all existing and added roadmaps appear exactly once in an intentional group

### Requirement: Canonical documentation reflects the expansion
Product and learning documentation MUST describe the expanded tracks, paths,
and coverage boundaries without claiming specialist depth that the curriculum
does not provide.

#### Scenario: Maintainer checks documented scope
- **WHEN** the maintainer reads the product overview and learning index
- **THEN** the documented track inventory and roadmap organization match executable curriculum data

### Requirement: Cross-domain AI systems synthesis is explicit
The learning OS SHALL expose a compact roadmap that reuses stable concepts from Systems Foundations, AI Models & Training, and Inference & Serving to show how a model operation becomes production work.

#### Scenario: User scans AI-native paths
- **WHEN** the user browses the AI-native roadmap group
- **THEN** the Trace a Tensor synthesis roadmap appears exactly once and is distinguishable from the longer specialist paths
