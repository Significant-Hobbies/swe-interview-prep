# Requirements Scoping

Separating functional from non-functional requirements and cutting scope to something buildable.

- Difficulty: core
- Tracks: System Design

## Mental model

Functional requirements say what the system does; non-functional ones say what it must survive — and only the second kind changes the architecture. 'Users can post' does not tell you anything, while 'reads outnumber writes 100:1 and p99 must stay under 200ms' picks your caching and replication strategy outright. Scoping is an act of subtraction: naming what you are explicitly not building is what makes the rest defensible.

## Where it matters

The skill the interview actually grades in the first ten minutes, and the same conversation that precedes any real design doc.

## Common mistakes

- Starting to design before agreeing what is out of scope, then re-architecting mid-answer
- Treating a latency or availability target as a detail to add later, when it is the constraint that selects the design
- Collecting requirements without a scale number, so every later decision is unfalsifiable
- Accepting 'highly available' as a requirement instead of pinning an availability target and its cost

## Primary sources

- [Site Reliability Engineering — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) (doc)

## Practice

### Split functional from non-functional

Implement classify(requirements) returning { functional, nonFunctional } — two arrays preserving input order. A functional requirement states what the system DOES; a non-functional one states a quality or constraint it must hold (latency, availability, throughput, durability, consistency, cost, security posture).

**Expected evidence:** 'Users can upload a photo' -> functional; 'p99 read latency under 200ms' -> nonFunctional

## Review prompts

- Two requirements: 'users can follow each other' and 'reads outnumber writes 100 to 1'. Which one changes the architecture, and why is that the whole point of the split?


## Prerequisites

- None assigned.

## Related concepts

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation)
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics)

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
