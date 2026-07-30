# Concurrency Design

Thread-safety, locks, producer-consumer.

- Difficulty: advanced
- Tracks: Systems Foundations, System Design

## Mental model

Concurrency bugs are usually not "add more locks." They are about having a clear discipline for which locks you take, in what order, and for how long. Often the cheapest fix is a single database transaction or a single-writer design.



## Primary sources

- [Concurrency (Wikipedia)](https://en.wikipedia.org/wiki/Concurrency_(computer_science)) (doc)

## Practice

### Concurrent bank transfers

Design transfer(from, to, amount) that is safe under concurrent calls. Address deadlock from circular locking, isolation, and what happens if one side fails mid-write.

**Expected evidence:** Locking order rule + pseudocode for the transfer + how you would test for deadlock.

## Review prompts

- Two threads deadlock. What is the discipline that prevents it, and why is adding a lock usually the wrong fix?

## Build evidence

- **Synthesize: Systems Foundations** — Build a mechanism-first model from hardware and kernels through runtimes, networks, performance, and isolation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html)

## Related concepts

- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management.html)

## Learning paths

- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice.html)
- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
