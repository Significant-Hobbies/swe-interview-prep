# Game/Simulation Design

Turn engines, board state, rules.

- Difficulty: core
- Tracks: Application Engineering, System Design

## Mental model

Realtime game servers run a tight loop over a shared world state. The server is the source of truth; the client predicts what will happen to hide latency, then corrects itself when the server disagrees.



## Primary sources

- [Game Programming Patterns (Nystrom) — chapter: State](https://gameprogrammingpatterns.com/state.html) (doc)
- [Refactoring.Guru — State pattern in games](https://refactoring.guru/design-patterns/state) (doc)

## Practice

### Realtime game server

Design the server for a 1v1 realtime game (chess clock, but with sub-100ms moves). Cover tick rate, authoritative state, and cheat resistance.

**Expected evidence:** Tick loop + the input → state-update → broadcast cycle + one cheat mitigation.

## Review prompts

- Client-side prediction hides latency. What does the client have to keep in order to correct itself?

## Build evidence

- **Synthesize: Application Engineering** — Turn backend, client, UX, real-time, interactive, analytics, and distribution skills into one complete product. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management.html)
- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html)

## Related concepts

- None assigned.

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice.html)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w.html)
