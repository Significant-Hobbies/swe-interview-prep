# In-process pub/sub bus

> Build an in-memory event bus: publishers fire events, subscribers register handlers by topic. Decide sync vs async delivery, error isolation, and unsubscribe semantics.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-pub-sub-bus

Build an in-memory event bus: publishers fire events, subscribers register handlers by topic. Decide sync vs async delivery, error isolation, and unsubscribe semantics.

## The mechanism

The observer pattern decouples who emits an event from who listens. Publishers fire events, subscribers register handlers, and the event bus is the registry that connects them. The tradeoff: flows are no longer visible in a single call stack, so debugging gets harder.

## Expected evidence

Bus interface (publish, subscribe, unsubscribe) + the subscriber registry data structure.

## Hints

- What happens if one subscriber throws?
- Keep the bus simple — no ordering guarantee unless asked.

## Sources and practice

- [Refactoring Guru — Observer](https://refactoring.guru/design-patterns/observer)
- [Study Observer Pattern](https://learn.significanthobbies.com/curriculum/concepts/observer-pattern)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-pub-sub-bus)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
