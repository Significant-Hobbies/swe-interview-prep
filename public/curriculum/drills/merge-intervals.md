# Merge overlapping intervals

> Merge [[1,3],[2,6],[8,10],[15,18]] → ?

Canonical: https://learn.significanthobbies.com/curriculum/drills/merge-intervals

Merge [[1,3],[2,6],[8,10],[15,18]] → ?

## The mechanism

Interval problems almost always start by sorting — usually by start time, sometimes by end. After sorting, a single pass with a couple of running variables (last end, current count) handles merge, overlap, scheduling, and room allocation.

## Expected evidence

[[1,6],[8,10],[15,18]].

## Hints

- Sort by start.
- Extend current if overlap.

## Sources and practice

- [Interval scheduling (Wikipedia)](https://en.wikipedia.org/wiki/Interval_scheduling)
- [Study Intervals](https://learn.significanthobbies.com/curriculum/concepts/intervals)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/merge-intervals)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
