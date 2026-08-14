# State Machines

States, transitions, guards.

- Difficulty: core
- Tracks: System Design

## Mental model

A state machine is a fixed set of states plus the rules for moving between them. The win is that illegal transitions become impossible by design — if you find yourself writing many "if status == X and Y" checks, you are simulating a state machine the hard way.



## Primary sources

- [Refactoring Guru — State](https://refactoring.guru/design-patterns/state) (doc)
- [Welcome to the world of Statecharts](https://statecharts.dev/) (doc)
- [Statecharts: A Visual Formalism for Complex Systems (Harel, 1987)](https://dubroy.com/refs/Statecharts_a_visual_formalism_for_complex_systems.pdf) (paper)
- [State machines and statecharts (Stately / XState docs)](https://stately.ai/docs/state-machines-and-statecharts) (doc)

## Practice

### Design a vending machine

Draw the state machine for a vending machine: Idle → Coin → Selecting → Dispense → Idle, plus refund / out-of-stock branches. List every transition trigger.

**Expected evidence:** A state diagram with 5-7 states, transitions labeled by input event.

## Review prompts

- Your code is full of `if (paid && !refunded && shippedAt == null)`. What does converting to a state machine actually buy you?


## Prerequisites

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling)

## Related concepts

- None assigned.

## Learning paths

- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w)
