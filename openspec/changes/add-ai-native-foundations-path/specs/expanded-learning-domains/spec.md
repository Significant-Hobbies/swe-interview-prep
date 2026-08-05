## MODIFIED Requirements

### Requirement: Curriculum navigation stays scannable
The learning page SHALL group the added roadmaps into clear systems, AI-native,
software-building, and human-interface families without hiding existing
roadmaps, and SHALL expose a compact high-level sequence from foundations
through parallel DSA and AI-engineering study to system-design synthesis.

#### Scenario: User scans all learning paths
- **WHEN** the learning or explore page renders roadmap groups
- **THEN** all existing and added roadmaps appear exactly once in an intentional group

#### Scenario: User needs a starting sequence
- **WHEN** the learner opens the learning page before choosing a detailed roadmap
- **THEN** they can identify foundations as the starting point, DSA and AI engineering as parallel work, and system design as the synthesis stage

#### Scenario: User scans the AI-engineering node
- **WHEN** the learner reads the compact AI-engineering stage
- **THEN** evaluation judgment is called out as a high-value skill alongside building AI systems

## ADDED Requirements

### Requirement: Machine-level foundations are practice-backed
The Systems Foundations path SHALL explicitly teach data representation and
low-level program memory through canonical concepts that each include a mental
model, primary source, executable drill, explain-back review question, and
placement before dependent operating-system and performance topics.

#### Scenario: Learner begins Systems Foundations
- **WHEN** the learner opens the first Systems Foundations milestone
- **THEN** binary and numeric representation, endianness, pointers, stack and heap, allocation, and program-to-process mechanics are represented by practice-backed concepts

### Requirement: Systems Foundations has a concrete default capstone
The Systems Foundations synthesis artifact SHALL default to a tiny HTTP/1.1
file server implemented with raw TCP sockets and SHALL require measured,
inspectable evidence connecting operating-system, networking, memory,
concurrency, and I/O decisions.

#### Scenario: Learner starts the synthesis artifact
- **WHEN** the learner opens the Systems Foundations capstone
- **THEN** the expected project, protocol boundary, failure injection, measurements, validation evidence, and architecture explanation are explicit

#### Scenario: Existing learner data is loaded
- **WHEN** stored mastery or artifact state references any existing curriculum ID
- **THEN** every pre-existing ID still resolves without migration
