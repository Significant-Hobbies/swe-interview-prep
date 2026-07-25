# Unified Site Navigation Specification

## Purpose

Define one fast, consistent destination hierarchy for the public homepage,
interactive application, and JavaScript-independent curriculum pages.

## Requirements

### Requirement: Every public and interactive surface uses one navigation model
The homepage, React application, and generated curriculum SHALL expose the same
primary and browse destination labels and paths from one canonical model.

#### Scenario: Navigation data changes
- **WHEN** a primary or browse destination is added, removed, or renamed
- **THEN** generated pages and React surfaces reflect the change without maintaining separate lists

### Requirement: Navigation remains static-first
Generated curriculum navigation MUST be usable as semantic HTML and CSS without
loading React, application bundles, or a backend response.

#### Scenario: JavaScript is unavailable
- **WHEN** a visitor opens any generated curriculum page without JavaScript
- **THEN** they can navigate to every primary and browse destination

### Requirement: Navigation adapts consistently
All surfaces SHALL use the same desktop and compact navigation hierarchy.

#### Scenario: Viewport becomes compact
- **WHEN** the viewport cannot fit the desktop navigation
- **THEN** one accessible disclosure exposes all primary and browse destinations without horizontal overflow

### Requirement: Account controls do not redefine navigation
Authentication, settings, and account controls MAY vary by user state but MUST
remain visually separate from the shared destination hierarchy.

#### Scenario: User state changes
- **WHEN** a visitor signs in, signs out, or continues as a guest
- **THEN** destination ordering and labels remain unchanged

### Requirement: Navigation consistency is verified
Automated checks MUST fail when generated navigation drifts from the canonical
model or when React surfaces reintroduce independent destination lists.

#### Scenario: Generated output is stale
- **WHEN** tests compare generated headers with the canonical model
- **THEN** missing, duplicated, or mismatched navigation links are reported
