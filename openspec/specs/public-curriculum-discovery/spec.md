# Public Curriculum Discovery Specification

## Purpose

Define the deterministic public projection of the canonical curriculum so
people, search crawlers, and AI agents can discover and understand the complete
learning catalog without executing the application.

## Requirements

### Requirement: Canonical curriculum has a deterministic public projection
The system SHALL generate public curriculum surfaces from the canonical track,
concept, roadmap, drill, review, artifact, and coverage data without requiring
manual duplication.

#### Scenario: Curriculum generation is repeated
- **WHEN** the publication generator runs twice against unchanged inputs
- **THEN** it produces the same set and content of public files without duplicate entries

### Requirement: Curriculum is readable without JavaScript
The system SHALL publish a curriculum hub and public detail pages for every
known track, roadmap, and concept under a route namespace that does not collide
with interactive SPA routes.

#### Scenario: Visitor opens a public concept
- **WHEN** a browser or crawler requests a generated concept URL
- **THEN** it receives substantive semantic HTML containing the concept explanation, mental model, learning source, practice direction, review prompt, and navigation

#### Scenario: Visitor browses the hierarchy
- **WHEN** a visitor starts at the curriculum hub
- **THEN** they can navigate through tracks and roadmaps to every published concept without signing in

### Requirement: Public pages meet metadata and structure standards
Every generated HTML page MUST include a concise title, meta description,
canonical URL, Open Graph metadata, exactly one H1, useful section headings,
and valid schema.org JSON-LD appropriate to its content type.

#### Scenario: Search crawler reads a generated page
- **WHEN** it parses the HTML without executing JavaScript
- **THEN** the page provides complete metadata, structured data, meaningful text, and internal links

### Requirement: Search discovery covers every public curriculum page
The sitemap SHALL include the curriculum hub and every generated track,
roadmap, and concept URL exactly once.

#### Scenario: Curriculum grows
- **WHEN** canonical data gains or loses a track, roadmap, or concept and generation runs
- **THEN** sitemap curriculum entries match the current generated page set

### Requirement: AI agents receive a useful curriculum catalog
The public agent catalog SHALL advertise compact Markdown and JSON curriculum
inventories and describe the product's complete public learning scope.

#### Scenario: Agent starts from llms.txt or api/ai
- **WHEN** it follows the advertised curriculum surface
- **THEN** it can enumerate tracks, roadmaps, concepts, and their public URLs without loading the SPA

### Requirement: Homepage explains the learning value
The public homepage SHALL present accurate curriculum counts, learning
domains, and the Concept → Drill → Build → Review → Apply loop in visible,
human-readable content.

#### Scenario: First-time visitor evaluates the product
- **WHEN** they open the homepage without signing in
- **THEN** they can understand what is taught, how practice works, and where to browse the public curriculum

### Requirement: Publication integrity is verified
Automated checks MUST fail when a canonical track, roadmap, or concept lacks
its generated page, when a public URL is missing from the sitemap, or when
agent catalog counts drift from canonical data.

#### Scenario: Generated output becomes stale
- **WHEN** integrity tests compare it with canonical curriculum data
- **THEN** the test reports the missing or mismatched IDs and blocks release
