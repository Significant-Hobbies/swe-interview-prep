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

### Requirement: Harness Engineering is a coherent learning path
The learning OS SHALL expose one selectable Harness Engineering roadmap inside Agent Systems that sequences instruction topology, workspace legibility, environment contracts, durable work state, scope control, feedback, independent verification, lifecycle control, and evaluation.

The path SHALL reuse existing stable concepts when they already cover an atomic skill and SHALL introduce a new concept only when the required idea is not represented.

#### Scenario: Learner opens the Harness Engineering path
- **WHEN** the learner selects Harness Engineering from Learn
- **THEN** the complete ordered path appears with every concept linked to its concept page and practice activity

#### Scenario: Existing agent knowledge is reused
- **WHEN** an existing concept already covers repository intelligence, coding-agent tools, durability, permissions, observability, or regression testing
- **THEN** the roadmap references that stable concept ID instead of creating a duplicate

### Requirement: Harness learning progresses through seven builds
The Harness Engineering path SHALL include seven progressively integrated projects: rules-first instructions, an agent-readable workspace, multi-session continuity, runtime feedback and scope control, independent self-verification, a complete harness capstone, and an automated maker-checker loop with explicit termination criteria.

#### Scenario: Learner advances through the path
- **WHEN** the learner completes milestones in order
- **THEN** each build adds a new harness subsystem while preserving the artifacts and contracts established earlier

#### Scenario: Learner reaches the capstone
- **WHEN** the final milestone is opened
- **THEN** it requires a bounded autonomous loop with a goal, durable state, maker-checker role separation, verification evidence, and a stop condition

### Requirement: Harness concepts participate in the full learning loop
Every newly introduced Harness Engineering concept SHALL have a mental model, authoritative resources, an editorial drill with an executable validation case, an explain-back review question, and a synthesis-artifact mapping.

#### Scenario: A harness gap is detected
- **WHEN** a learner misses a linked Blitz question or receives weak Tradeoff rubric evidence
- **THEN** the product can route the learner to the exact concept, drill, and review material

### Requirement: External curricula are coverage references, not copied product content
The product SHALL record the two referenced repositories as attribution and coverage inputs while keeping canonical learning material authored in the product and supported by authoritative sources.

#### Scenario: Maintainer audits curriculum provenance
- **WHEN** curriculum documentation is inspected
- **THEN** it identifies the external coverage inputs without treating their prose or repository structure as canonical product data

