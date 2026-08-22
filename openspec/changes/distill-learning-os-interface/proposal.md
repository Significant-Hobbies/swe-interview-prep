## Why

The product is polished but cognitively expensive: its shell and key entry pages expose too many destinations, status strips, secondary actions, and internal learning-system concepts at once. The owner wants the existing craft and capability preserved while making the next useful action obvious and moving optional complexity behind progressive disclosure.

## What Changes

- Reduce the canonical primary navigation to Dashboard, Learn, Practice, and Wars.
- Turn Dashboard into the learner's resumable state: recent visits, current and next learning, previous and next practice, available paths, and supporting progress.
- Make Learn a searchable high-level library with an explicit, complete catalogue rather than an exhaustive landing page.
- Make Practice the existing Playground itself and add a searchable problem selector backed by the complete canonical drill inventory.
- Simplify Software Wars to two plainly named modes: a one-minute MCQ battle and a thirty-minute matched engineering battle.
- Add a focused-session shell state for active battles and workspaces so global banners and nonessential controls do not compete with the task.
- Preserve every existing route, deep link, catalogue item, public curriculum page, learning capability, accessibility requirement, visual identity, and server contract.

## Capabilities

### New Capabilities

- `focused-learning-interface`: Defines one-primary-action entry pages, progressively disclosed secondary information, consolidated practice modes, and distraction-reduced active sessions.

### Modified Capabilities

- `unified-site-navigation`: Reduces the shared primary destination hierarchy and requires secondary tools to remain reachable through contextual hubs and compact browse disclosure.

## Impact

- Affects the canonical navigation model, React and generated public headers, global Layout chrome, Dashboard/Today, Learn, Playground/Practice, Progress discovery, Software Wars, and active battle/workspace presentation.
- Requires updates to navigation-generation and route/component/E2E tests plus canonical product and surface documentation.
- Does not change APIs, databases, authentication, mastery rules, ranked scoring, RealtimeKit behavior, or production dependencies.
