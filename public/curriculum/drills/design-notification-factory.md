# Notification factory

> Design a Notification factory that returns Email / SMS / Push notifiers from a single create(type, payload) call. Show where channel-specific config lives.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-notification-factory

Design a Notification factory that returns Email / SMS / Push notifiers from a single create(type, payload) call. Show where channel-specific config lives.

## The mechanism

Creational patterns (Factory, Builder, Singleton) hide how an object is constructed so callers do not pin themselves to a specific concrete class. They earn their keep when you add the 4th variant without callers needing to change.

## Expected evidence

Factory + 3 concrete notifiers + the registration mechanism for adding a 4th.

## Hints

- Map of type → constructor beats a switch.
- Keep the factory dumb; let notifiers carry their own config.

## Sources and practice

- [Refactoring Guru — Factory Method](https://refactoring.guru/design-patterns/factory-method)
- [Study Factory & Creational](https://learn.significanthobbies.com/curriculum/concepts/factory-creational)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-notification-factory)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
