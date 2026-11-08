# Design a vending machine

> Draw the state machine for a vending machine: Idle → Coin → Selecting → Dispense → Idle, plus refund / out-of-stock branches. List every transition trigger.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-vending-machine

Draw the state machine for a vending machine: Idle → Coin → Selecting → Dispense → Idle, plus refund / out-of-stock branches. List every transition trigger.

## The mechanism

A state machine is a fixed set of states plus the rules for moving between them. The win is that illegal transitions become impossible by design — if you find yourself writing many "if status == X and Y" checks, you are simulating a state machine the hard way.

## Expected evidence

A state diagram with 5-7 states, transitions labeled by input event.

## Hints

- What does pressing a button do in each state?
- Where does coin-return live?

## Sources and practice

- [Refactoring Guru — State](https://refactoring.guru/design-patterns/state)
- [Welcome to the world of Statecharts](https://statecharts.dev/)
- [Statecharts: A Visual Formalism for Complex Systems (Harel, 1987)](https://dubroy.com/refs/Statecharts_a_visual_formalism_for_complex_systems.pdf)
- [State machines and statecharts (Stately / XState docs)](https://stately.ai/docs/state-machines-and-statecharts)
- [Study State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-vending-machine)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
