# Coffee-shop order decorator

> Model a coffee order with milk / sugar / whip add-ons via the decorator pattern. cost() and description() should compose automatically.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-coffee-decorator

Model a coffee order with milk / sugar / whip add-ons via the decorator pattern. cost() and description() should compose automatically.

## The mechanism

The decorator pattern wraps an object in another object with the same interface, adding behavior without subclassing. It shines when feature combinations explode — instead of one class per combination, you stack small decorators.

## Expected evidence

Base Beverage + 3 decorators, plus a sample order chain and its computed cost.

## Hints

- Each decorator wraps a Beverage and is itself a Beverage.
- Order of wrapping matters for description, not cost.

## Sources and practice

- [Refactoring Guru — Decorator](https://refactoring.guru/design-patterns/decorator)
- [Study Decorator & Structural](https://learn.significanthobbies.com/curriculum/concepts/decorator-structural)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-coffee-decorator)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
