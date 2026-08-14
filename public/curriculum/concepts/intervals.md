# Intervals

Merge, overlap, sweep line.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Interval problems almost always start by sorting — usually by start time, sometimes by end. After sorting, a single pass with a couple of running variables (last end, current count) handles merge, overlap, scheduling, and room allocation.



## Primary sources

- [Interval scheduling (Wikipedia)](https://en.wikipedia.org/wiki/Interval_scheduling) (doc)

## Practice

### Merge overlapping intervals

Merge [[1,3],[2,6],[8,10],[15,18]] → ?

**Expected evidence:** [[1,6],[8,10],[15,18]].

## Review prompts

- Merging overlapping intervals sorts by start time; picking the most non-overlapping intervals sorts by end time. Why the difference?


## Prerequisites

- [Greedy](https://learn.significanthobbies.com/curriculum/concepts/greedy)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
