# Undo / redo stack

> Design undo/redo for a text editor using the Command pattern. Each user action becomes a Command with execute/undo. Decide how the redo stack interacts with new edits.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-undo-redo

Design undo/redo for a text editor using the Command pattern. Each user action becomes a Command with execute/undo. Decide how the redo stack interacts with new edits.

## The mechanism

The command pattern turns an action into a small object you can store, queue, log, or reverse. Pair it with two stacks for undo/redo, with a queue for background jobs, or with a chain for middleware-style processing.

## Expected evidence

Command interface + 2-3 concrete commands + the two stacks and their invariants.

## Hints

- New action after undo should clear the redo stack.
- Group small typing actions into one Command for usability.

## Sources and practice

- [Refactoring Guru — Command](https://refactoring.guru/design-patterns/command)
- [Study Command & Chain](https://learn.significanthobbies.com/curriculum/concepts/command-chain)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-undo-redo)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
