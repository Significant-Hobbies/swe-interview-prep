# Capacity Estimation

Back-of-the-envelope QPS, storage, and bandwidth maths that sizes a design before you draw it.

- Difficulty: core
- Tracks: System Design

## Mental model

Estimation exists to eliminate designs, not to be accurate. One order of magnitude is the whole game: 100 GB/day means one machine, 100 TB/day means a fleet, and that single answer picks your storage engine, your sharding story, and whether replication is affordable. Do it before the boxes-and-arrows, because a design drawn without a number is a design you cannot defend.

## Where it matters

The first five minutes of every HLD interview, and the calculation that decides whether a feature needs a queue or a cron job.

## Common mistakes

- Chasing precision — carrying three significant figures through an estimate whose input was a guess
- Estimating average load and sizing for it, when peak is what falls over; assume peak is several times the mean
- Forgetting the multipliers that dominate: replication factor, indexes, and retention window often exceed the raw payload
- Quoting a storage number without a time horizon — per day and per year lead to different architectures

## Primary sources

- [Site Reliability Engineering (Google) — chapter 21: Handling Overload](https://sre.google/sre-book/handling-overload/) (doc)

## Practice

### Size a write-heavy service

Implement size(dau, writesPerUserPerDay, bytesPerWrite, replicationFactor, peakMultiplier) returning { writesPerSecond, peakWritesPerSecond, storagePerDayGB, storagePerYearTB }. Use 86400 s/day and 365 d/yr. Storage counts replication. Use GB = 1e9 bytes and TB = 1e12 bytes (decimal, as capacity planning does). Round every value to the nearest integer.

**Expected evidence:** size(10e6, 20, 500, 3, 5) -> { writesPerSecond: 2315, peakWritesPerSecond: 11574, storagePerDayGB: 300, storagePerYearTB: 110 }

## Review prompts

- Why is a back-of-the-envelope estimate useful even when the inputs are guesses, and what makes an estimate that is wrong by 10x different from one wrong by 2x?


## Prerequisites

- None assigned.

## Related concepts

- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping)

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
