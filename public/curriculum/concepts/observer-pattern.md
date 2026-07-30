# Observer Pattern

Pub/sub, event propagation.

- Difficulty: core
- Tracks: System Design

## Mental model

The observer pattern decouples who emits an event from who listens. Publishers fire events, subscribers register handlers, and the event bus is the registry that connects them. The tradeoff: flows are no longer visible in a single call stack, so debugging gets harder.



## Primary sources

- [Refactoring Guru — Observer](https://refactoring.guru/design-patterns/observer) (doc)

## Practice

### In-process pub/sub bus

Build an in-memory event bus: publishers fire events, subscribers register handlers by topic. Decide sync vs async delivery, error isolation, and unsubscribe semantics.

**Expected evidence:** Bus interface (publish, subscribe, unsubscribe) + the subscriber registry data structure.

## Review prompts

- What debugging capability do you lose when direct calls become pub/sub, and how do you get it back?


## Prerequisites

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html)

## Related concepts

- None assigned.

## Learning paths

- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice.html)
