# Design a parking lot

> Model a parking lot with vehicle classes (Car/Bike/Truck), spot sizes, a Lot/Level/Spot hierarchy, and entry/exit. Define the 4-6 classes, their fields, and the park()/leave() interactions.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-parking-lot

Model a parking lot with vehicle classes (Car/Bike/Truck), spot sizes, a Lot/Level/Spot hierarchy, and entry/exit. Define the 4-6 classes, their fields, and the park()/leave() interactions.

## The mechanism

Object modeling is finding the small set of "things" the system has (usually 4-7) and the actions that happen between them. Prefer composition (this has-a) over inheritance (this is-a). A good model makes the next requirement easy to add.

## Expected evidence

Class diagram + the park() flow showing how spot allocation handles size mismatch.

## Hints

- Composition over inheritance for vehicle ↔ spot fit.
- Where does pricing live — Spot, Level, or Lot?

## Sources and practice

- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns)
- [Study Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-parking-lot)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
