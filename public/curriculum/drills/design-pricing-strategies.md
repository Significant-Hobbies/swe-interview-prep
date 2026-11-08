# Pluggable pricing strategies

> Design a checkout system where pricing strategy is swappable: flat, percentage-off, BOGO, member-tier. Each strategy is a class with the same price(cart) signature.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-pricing-strategies

Design a checkout system where pricing strategy is swappable: flat, percentage-off, BOGO, member-tier. Each strategy is a class with the same price(cart) signature.

## The mechanism

The strategy pattern lets you swap an algorithm at runtime by hiding it behind a common interface. The caller does not know (or care) which version is used. Reach for it when "the same operation has many implementations" — pricing rules, sort orders, routing strategies.

## Expected evidence

Interface + 4 concrete strategies + how the cart picks one at runtime.

## Hints

- Inject the strategy; do not let cart code know its type.
- Compose strategies for stacked discounts.

## Sources and practice

- [Refactoring Guru — Strategy](https://refactoring.guru/design-patterns/strategy)
- [Study Strategy Pattern](https://learn.significanthobbies.com/curriculum/concepts/strategy-pattern)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-pricing-strategies)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
