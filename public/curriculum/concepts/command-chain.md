# Command & Chain

Command, undo, chain of responsibility.

- Difficulty: core
- Tracks: System Design

## Mental model

The command pattern turns an action into a small object you can store, queue, log, or reverse. Pair it with two stacks for undo/redo, with a queue for background jobs, or with a chain for middleware-style processing.



## Primary sources

- [Refactoring Guru — Command](https://refactoring.guru/design-patterns/command) (doc)

## Practice

### Undo / redo stack

Design undo/redo for a text editor using the Command pattern. Each user action becomes a Command with execute/undo. Decide how the redo stack interacts with new edits.

**Expected evidence:** Command interface + 2-3 concrete commands + the two stacks and their invariants.

## Review prompts

- What must a command object carry to support undo, and where does undo stop working?


## Prerequisites

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html)

## Related concepts

- None assigned.

## Learning paths

- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice.html)
