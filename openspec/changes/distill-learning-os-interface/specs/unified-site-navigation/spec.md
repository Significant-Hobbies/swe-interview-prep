## MODIFIED Requirements

### Requirement: Every public and interactive surface uses one navigation model
The homepage, React application, and generated curriculum SHALL expose Dashboard, Learn, Practice, and Wars as the shared primary destinations from one canonical model. Secondary destinations SHALL remain available through one shared browse disclosure or a contextual hub rather than appearing as peer primary destinations.

#### Scenario: Navigation data changes
- **WHEN** a primary or browse destination is added, removed, renamed, or reclassified
- **THEN** generated pages and React surfaces reflect the change without maintaining separate lists

#### Scenario: Learner seeks a secondary tool
- **WHEN** Mock, Playground, Build Lab, Systems Labs, Software Wars, sources, library, or detailed catalogs are not shown in primary navigation
- **THEN** the learner can reach them through Dashboard, Learn, Practice, Wars, or the shared browse disclosure

### Requirement: Navigation adapts consistently
All surfaces SHALL use the same four-destination desktop and compact primary hierarchy, with secondary destinations grouped by learner intent rather than exposed as one flat list.

#### Scenario: Viewport becomes compact
- **WHEN** the viewport cannot fit the desktop navigation
- **THEN** one accessible disclosure exposes the four primary destinations and grouped secondary destinations without horizontal overflow

### Requirement: Navigation consistency is verified
Automated checks MUST fail when generated navigation drifts from the canonical model, when React surfaces reintroduce independent destination lists, when more than four destinations are classified as primary, or when legacy `/today`, `/playground`, `/progress`, and catalogue links stop resolving.

#### Scenario: Generated output is stale
- **WHEN** tests compare generated headers with the canonical model
- **THEN** missing, duplicated, mismatched, or incorrectly classified navigation links are reported
