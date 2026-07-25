# Unify Site Navigation

## Why

The homepage, interactive learning application, and generated public
curriculum currently render three unrelated headers. The product is
static-first and does not need separate navigation identities to remain fast.
Moving between surfaces should feel like staying in one learning system.

## What Changes

- Define one canonical navigation model for primary learning destinations and
  browse destinations.
- Use one React header component on the logged-out homepage and interactive app.
- Render the same information architecture and visual treatment into generated
  curriculum HTML.
- Replace the separate mobile bottom navigation with the same responsive header
  pattern used everywhere else.
- Keep account and settings controls conditional without changing the shared
  navigation.

## Non-goals

- No backend, authentication, database, or API changes.
- No client-side framework added to generated curriculum pages.
- No redesign of page content below the header.

## Impact

The change touches the app shell, logged-out page, public curriculum generator,
static styles, navigation data, and focused consistency tests. Generated pages
remain semantic HTML and CSS with no JavaScript dependency.
