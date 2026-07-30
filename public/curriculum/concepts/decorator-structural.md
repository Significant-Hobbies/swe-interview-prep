# Decorator & Structural

Decorator, adapter, composite.

- Difficulty: core
- Tracks: System Design

## Mental model

The decorator pattern wraps an object in another object with the same interface, adding behavior without subclassing. It shines when feature combinations explode — instead of one class per combination, you stack small decorators.



## Primary sources

- [Refactoring Guru — Decorator](https://refactoring.guru/design-patterns/decorator) (doc)

## Practice

### Coffee-shop order decorator

Model a coffee order with milk / sugar / whip add-ons via the decorator pattern. cost() and description() should compose automatically.

**Expected evidence:** Base Beverage + 3 decorators, plus a sample order chain and its computed cost.

## Review prompts

- Why does decoration beat subclassing when features combine, and what does it cost?


## Prerequisites

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html)

## Related concepts

- None assigned.

## Learning paths

- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice.html)
