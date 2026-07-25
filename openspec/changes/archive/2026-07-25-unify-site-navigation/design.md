# Design

## Navigation model

A small typed data module owns the primary and browse link labels and paths.
React surfaces and the static generator consume that same model, preventing
label or destination drift.

Primary destinations remain task-oriented:

- Today
- Learn
- Practice
- Mock
- Playground
- Progress

Browse contains the wider catalog, led by the public Curriculum, followed by
sources, library, exploration, docs, Build Lab, projects, and notes.

## Shared header

`SiteHeader` becomes the React renderer used by both `Layout` and `Login`.
It owns brand markup, desktop navigation, the Browse disclosure, responsive
navigation, focus treatment, and active states. Callers supply only optional
right-side controls such as sign-in, account, or settings.

Generated pages render equivalent semantic markup from the canonical model.
They do not hydrate React and do not require JavaScript. A native `details`
disclosure provides the responsive menu.

## Performance

- Static curriculum navigation remains HTML and CSS only.
- The shared model contains only strings and does not import curriculum data.
- The React header adds no production dependency and no network request.
- Existing lazy loading of settings and digest content remains intact.

## Responsive behavior

Desktop shows the primary links and Browse disclosure in the header. Compact
viewports show the brand, caller actions, and one native Menu disclosure
containing every primary and browse destination. The same structure replaces
the app-only mobile bottom bar.

## Accessibility

- A skip link precedes navigation.
- Navigation landmarks have explicit accessible labels.
- Disclosures use native `details` and `summary`.
- Focus-visible treatment is consistent.
- Active React routes expose `aria-current="page"`.
