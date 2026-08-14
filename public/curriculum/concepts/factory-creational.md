# Factory & Creational

Abstract factory, builder, singleton.

- Difficulty: core
- Tracks: System Design

## Mental model

Creational patterns (Factory, Builder, Singleton) hide how an object is constructed so callers do not pin themselves to a specific concrete class. They earn their keep when you add the 4th variant without callers needing to change.



## Primary sources

- [Refactoring Guru — Factory Method](https://refactoring.guru/design-patterns/factory-method) (doc)

## Practice

### Notification factory

Design a Notification factory that returns Email / SMS / Push notifiers from a single create(type, payload) call. Show where channel-specific config lives.

**Expected evidence:** Factory + 3 concrete notifiers + the registration mechanism for adding a 4th.

## Review prompts

- What is the concrete signal that a factory earns its keep rather than just adding a layer?


## Prerequisites

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling)

## Related concepts

- None assigned.

## Learning paths

- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice)
