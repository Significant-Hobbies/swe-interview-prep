## Purpose

Define a calmer interaction hierarchy that preserves the Learning OS's full capability while helping a learner identify and start the next useful action with minimal cognitive load.

## ADDED Requirements

### Requirement: Entry surfaces present one primary action
Dashboard, Learn, and Software Wars SHALL each present one visually dominant next action before optional status, history, or alternate-path information. Practice SHALL open directly into the Playground workspace with a problem selected or immediately selectable.

#### Scenario: Learner opens an entry surface
- **WHEN** a learner opens Dashboard, Learn, Practice, or Software Wars
- **THEN** the first task region identifies one recommended action and no peer action competes at equal emphasis

### Requirement: Secondary information uses progressive disclosure
Entry surfaces MUST keep diagnostics, alternate modes, historical data, content inventories, and configuration details accessible without rendering all of them in the initial decision path.

#### Scenario: Learner needs more context
- **WHEN** the learner requests additional options or details
- **THEN** the surface reveals the relevant existing functionality without navigating through an unrelated workflow

### Requirement: Dashboard exposes resumable learning state
Dashboard SHALL show recent destinations, the active learning path, the current and next learning items, the previous and next practice items, and a concise view of available paths.

#### Scenario: Learner returns to the product
- **WHEN** a learner opens Dashboard after navigating or practising
- **THEN** they can resume the most relevant learning or practice action and inspect recent destinations without reconstructing context

### Requirement: Learn is searchable and complete
Learn SHALL provide high-level path orientation, search across every canonical concept and roadmap, and an explicit browse-complete-catalogue path. No canonical item may depend on an exact search term for discovery.

#### Scenario: Learner searches the catalogue
- **WHEN** a learner enters a concept, roadmap, domain, or description fragment
- **THEN** matching canonical content is shown with stable links and the full catalogue remains reachable independently of search

### Requirement: Practice is the Playground
The Practice destination SHALL render the existing Playground workspace and expose a searchable problem selector sourced from the complete canonical practice inventory.

#### Scenario: Learner wants a non-drill practice mode
- **WHEN** the learner opens Practice or selects an internal problem
- **THEN** the problem statement and concept context load into the Playground without an intermediate practice hub

#### Scenario: Learner needs the complete problem inventory
- **WHEN** the learner opens the problem selector or browse-all practice route
- **THEN** every canonical internal and external practice item remains visible, searchable, and linked without changing its stable identifier

### Requirement: Wars presents two duration-based modes
Software Wars SHALL present a one-minute MCQ battle and a thirty-minute matched engineering battle as its only initial peer choices.

#### Scenario: Learner chooses a battle duration
- **WHEN** the learner selects one minute or thirty minutes
- **THEN** they enter the existing Blitz or Tradeoff flow respectively, with ratings and history remaining secondary

### Requirement: Active sessions reduce unrelated chrome
Active battle and focused workspace routes SHALL suppress nonessential promotional, digest, setup, and feedback chrome while retaining route identity, account access, keyboard navigation, and a clear exit path.

#### Scenario: Learner enters a focused session
- **WHEN** a learner starts an active battle or opens a focused workspace
- **THEN** the task, state, and next action receive priority over global discovery and status UI

### Requirement: Simplification preserves capability and accessibility
The distilled interface MUST preserve existing routes, deep links, catalogue coverage, public curriculum outputs, data, learning rules, keyboard operation, 44-pixel compact controls, and reduced-motion behavior.

#### Scenario: Catalogue parity is checked
- **WHEN** automated tests compare visible/searchable inventory with canonical concepts, roadmaps, and practice items
- **THEN** missing content, missing stable links, or inaccessible browse-all paths fail verification

#### Scenario: Existing deep link is opened
- **WHEN** a learner opens a previously supported route directly
- **THEN** the same capability remains available even if it is no longer a primary navigation destination

#### Scenario: Compact keyboard-only use
- **WHEN** a learner uses the interface at 390 pixels wide with a keyboard and reduced motion enabled
- **THEN** primary and disclosed secondary actions remain reachable, legible, and free of horizontal overflow
