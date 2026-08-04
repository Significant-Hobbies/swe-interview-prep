## Purpose

Expands the structured interview library with the recurring product, infrastructure, storage, and transaction problems candidates are most likely to encounter while preserving substantive study and publication quality.

## ADDED Requirements

### Requirement: Twelve high-frequency cases
The system SHALL add exactly these twelve stable case IDs: `video-streaming-platform`, `photo-sharing-platform`, `collaborative-document-editor`, `notification-delivery-service`, `web-crawler`, `distributed-cache`, `search-autocomplete`, `cloud-file-storage`, `distributed-key-value-store`, `ride-sharing-platform`, `ticket-booking-platform`, and `payment-processing-system`.

Each case SHALL satisfy the canonical case schema with six stages, hidden assumptions, unit-carrying calculation anchors, deterministic follow-up and failure branches, five weighted rubric dimensions, stronger-answer material, common mistakes, harder follow-ups, concept remediation, drill remediation, and primary or first-party sources.

#### Scenario: Catalog accepts the complete batch
- **WHEN** the canonical catalog is validated
- **THEN** all twelve new IDs are present exactly once and all references resolve

#### Scenario: A new case is attempted
- **WHEN** a learner selects any new case
- **THEN** the existing closed-book stage order, answer visibility, save/resume, grading, and targeted-remediation behavior applies without a special-case session path

### Requirement: Pattern breadth over product-name memorization
The batch SHALL exercise distinct reusable interview patterns across media delivery, fan-out, asynchronous scheduling, web-scale crawling, cache partitioning, prefix retrieval, object metadata and synchronization, replicated storage, geospatial matching, scarce-inventory transactions, ledger correctness, collaborative convergence, and social media processing.

Each case SHALL make the reusable pattern and its principal trade-off visible in the prompt or review rather than treating a branded product architecture as the only correct answer.

#### Scenario: Learner reviews the expanded catalog
- **WHEN** the learner compares the new cases
- **THEN** each case exposes a distinct critical path and failure mode instead of duplicating an existing case under a different product name

### Requirement: Six substantive worked guides
The first publication batch SHALL contain complete worked guides for `video-streaming-platform`, `notification-delivery-service`, `web-crawler`, `cloud-file-storage`, `ride-sharing-platform`, and `ticket-booking-platform`.

Each approved guide SHALL contain at least 1,200 visible words, requirements and non-goals, capacity calculations with units, architecture and data flow, a deep technical decision, failure and recovery behavior, observability or cost considerations, common mistakes, harder follow-ups, an answer outline, internal practice links, and at least three authoritative sources.

#### Scenario: Approved guide is generated
- **WHEN** public curriculum generation runs
- **THEN** each of the six approved cases emits matching canonical HTML and Markdown pages with substantive content and source links

#### Scenario: Guide does not meet the editorial contract
- **WHEN** a guide is missing required sections, minimum substance, or authoritative sources
- **THEN** validation fails before a public artifact can be generated

### Requirement: No thin public case pages
The six cases without an approved guide SHALL remain available in the interactive practice catalog but SHALL NOT receive placeholder, templated, or thin public HTML URLs.

#### Scenario: Practice-only case is generated
- **WHEN** public generation runs for a case whose publication state is not approved
- **THEN** the hub links to its practice entrypoint and no guide HTML, Markdown, canonical, or sitemap entry is emitted for that case

### Requirement: Navigable twenty-case hub
The public system-design hub and interactive selector SHALL group all twenty cases into meaningful interview-pattern categories and SHALL expose difficulty, duration, practice availability, and guide availability without relying only on alphabetical ordering.

#### Scenario: Learner browses the expanded hub
- **WHEN** the hub is rendered after the batch is added
- **THEN** all twenty cases are discoverable under a relevant category and only approved guides present a study link

### Requirement: Search and agent discovery integrity
Every approved guide SHALL have a unique title, meta description, canonical URL, Article and BreadcrumbList structured data, sitemap entry, Markdown mirror, and links from the hub and machine-readable catalogs. Generated counts SHALL report twenty practice cases and seven approved guides in total, including the existing LLM inference guide.

#### Scenario: Publication integrity runs
- **WHEN** the generated public artifacts are tested
- **THEN** guide counts, canonical URLs, metadata, schema types, source links, hub links, sitemap entries, and Markdown mirrors match the canonical approval state exactly

### Requirement: Existing attempt compatibility
Adding and grouping cases SHALL NOT change existing case IDs, versions, local attempt keys, rubric semantics, legacy technical mocks, or behavioral mocks.

#### Scenario: Existing saved attempt is resumed
- **WHEN** a learner reloads a supported attempt from the first case batch
- **THEN** the attempt resumes against the same case version and answers without migration or data loss
