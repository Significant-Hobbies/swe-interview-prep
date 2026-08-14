# Strategy Pattern

Interchangeable algorithms.

- Difficulty: core
- Tracks: System Design

## Mental model

The strategy pattern lets you swap an algorithm at runtime by hiding it behind a common interface. The caller does not know (or care) which version is used. Reach for it when "the same operation has many implementations" — pricing rules, sort orders, routing strategies.



## Primary sources

- [Refactoring Guru — Strategy](https://refactoring.guru/design-patterns/strategy) (doc)

## Practice

### Pluggable pricing strategies

Design a checkout system where pricing strategy is swappable: flat, percentage-off, BOGO, member-tier. Each strategy is a class with the same price(cart) signature.

**Expected evidence:** Interface + 4 concrete strategies + how the cart picks one at runtime.

## Review prompts

- Strategy pattern versus a switch statement — what concretely changes?


## Prerequisites

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling)

## Related concepts

- None assigned.

## Learning paths

- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice)
