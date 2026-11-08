# Realtime game server

> Design the server for a 1v1 realtime game (chess clock, but with sub-100ms moves). Cover tick rate, authoritative state, and cheat resistance.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-online-game-server

Design the server for a 1v1 realtime game (chess clock, but with sub-100ms moves). Cover tick rate, authoritative state, and cheat resistance.

## The mechanism

Realtime game servers run a tight loop over a shared world state. The server is the source of truth; the client predicts what will happen to hide latency, then corrects itself when the server disagrees.

## Expected evidence

Tick loop + the input → state-update → broadcast cycle + one cheat mitigation.

## Hints

- Clients predict; the server reconciles.
- Never trust client-reported timestamps.

## Sources and practice

- [Game Programming Patterns (Nystrom) — chapter: State](https://gameprogrammingpatterns.com/state.html)
- [Refactoring.Guru — State pattern in games](https://refactoring.guru/design-patterns/state)
- [Study Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-online-game-server)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
