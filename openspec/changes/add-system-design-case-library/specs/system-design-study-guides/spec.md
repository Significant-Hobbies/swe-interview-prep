## Purpose

Publish substantive, source-backed system-design interview guides from reviewed case data so learners can study a complete worked approach and search engines can index genuinely useful answers.

## ADDED Requirements

### Requirement: Published guides derive from canonical cases
The system SHALL generate the public case hub and each approved guide from the same case version used by structured practice.

#### Scenario: A case is approved for publication
- **WHEN** public generation runs
- **THEN** its title, prompt, assumptions, calculations, rubric concepts, failure scenario, and sources match the canonical case definition

#### Scenario: A practice-only case is not approved for publication
- **WHEN** public generation runs
- **THEN** the case remains available in private practice without emitting a thin or placeholder guide URL

### Requirement: Every guide is a complete worked lesson
Each published guide MUST contain a clear prompt interpretation, clarifying questions, stated assumptions, capacity math with units, architecture walkthrough, critical-path deep dive, failure handling, observability and cost discussion, common mistakes, harder follow-ups, concept remediation links, and a concise final answer outline.

#### Scenario: Learner studies the LLM inference case
- **WHEN** they open the public 10,000-requests-per-second guide
- **THEN** they can follow an end-to-end answer that separates request throughput from input and output token throughput and sizes the fleet from measured per-replica performance with explicit headroom

### Requirement: Technical claims are source-backed
Each published guide SHALL cite primary or official sources for non-obvious mechanisms and MUST distinguish benchmark-dependent examples from stable principles.

#### Scenario: Guide discusses batching or KV-cache memory
- **WHEN** it states how the serving mechanism works
- **THEN** it links to the relevant paper or official serving documentation and does not present an illustrative GPU count as universally correct

### Requirement: Guide intent is distinct and non-duplicative
The case hub SHALL target browsing common system-design interview questions, while each guide SHALL answer one concrete prompt and link to narrower concept pages for mechanism depth.

#### Scenario: Guide and concept page overlap
- **WHEN** both mention the same mechanism
- **THEN** the guide applies it to the case and links to the concept page instead of duplicating the concept lesson verbatim

### Requirement: Public answers do not compromise active attempts
Public guides SHALL remain browsable, but the active practice interface MUST not reveal or embed guide content before submission.

#### Scenario: Learner starts from a public guide
- **WHEN** they choose to practice the case
- **THEN** the application starts a fresh attempt and clearly warns that returning to the guide exits closed-book practice

### Requirement: Publication readiness is explicit
A guide SHALL be emitted only when its case declares publication approval and passes content, source, metadata, link, and substantive-length validation.

#### Scenario: Draft guide lacks required evidence
- **WHEN** the generator validates a missing source, required section, internal remediation link, or publication approval
- **THEN** generation fails with the case ID and missing requirement
