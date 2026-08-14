# Object Modeling

Identifying classes, attributes, relationships.

- Difficulty: core
- Tracks: System Design

## Mental model

Object modeling is finding the small set of "things" the system has (usually 4-7) and the actions that happen between them. Prefer composition (this has-a) over inheritance (this is-a). A good model makes the next requirement easy to add.



## Primary sources

- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns) (doc)

## Practice

### Design a parking lot

Model a parking lot with vehicle classes (Car/Bike/Truck), spot sizes, a Lot/Level/Spot hierarchy, and entry/exit. Define the 4-6 classes, their fields, and the park()/leave() interactions.

**Expected evidence:** Class diagram + the park() flow showing how spot allocation handles size mismatch.

## Review prompts

- When does "is-a" inheritance actively hurt, and what is the tell?


## Prerequisites

- None assigned.

## Related concepts

- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management)

## Learning paths

- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice)
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w)
