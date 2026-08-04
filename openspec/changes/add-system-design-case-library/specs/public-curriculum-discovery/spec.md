## ADDED Requirements

### Requirement: Public discovery includes approved system-design guides
The public projection SHALL include a JavaScript-free system-design case hub and every publication-approved guide in navigation, sitemap, Markdown catalogs, and agent-readable inventories.

#### Scenario: Guide is approved or withdrawn
- **WHEN** canonical case data changes and public generation runs
- **THEN** generated HTML, Markdown, sitemap, and catalog entries match the current approved guide set exactly once

### Requirement: System-design guides expose appropriate structured data
Every generated guide MUST include canonical metadata and valid schema.org Article and BreadcrumbList data derived from the canonical case.

#### Scenario: Search crawler reads a guide
- **WHEN** it parses the HTML without JavaScript
- **THEN** it can identify the headline, description, publication or modification date, authoring organization, breadcrumb hierarchy, and canonical URL

### Requirement: Publication integrity covers case surfaces
Automated checks MUST fail when the case hub or an approved guide is missing its generated HTML, Markdown equivalent, sitemap entry, catalog entry, canonical link, or required internal practice link.

#### Scenario: Generated case output drifts
- **WHEN** integrity tests compare public files with canonical case data
- **THEN** the test names each missing or mismatched case ID and blocks release
