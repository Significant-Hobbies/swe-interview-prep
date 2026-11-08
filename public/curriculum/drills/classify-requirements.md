# Split functional from non-functional

> Implement classify(requirements) returning { functional, nonFunctional } — two arrays preserving input order. A functional requirement states what the system DOES; a non-functional one states a quality or constraint it must hold (latency, availability, throughput, durability, consistency, cost, security posture).

Canonical: https://learn.significanthobbies.com/curriculum/drills/classify-requirements

Implement classify(requirements) returning { functional, nonFunctional } — two arrays preserving input order. A functional requirement states what the system DOES; a non-functional one states a quality or constraint it must hold (latency, availability, throughput, durability, consistency, cost, security posture).

## The mechanism

Functional requirements say what the system does; non-functional ones say what it must survive — and only the second kind changes the architecture. 'Users can post' does not tell you anything, while 'reads outnumber writes 100:1 and p99 must stay under 200ms' picks your caching and replication strategy outright. Scoping is an act of subtraction: naming what you are explicitly not building is what makes the rest defensible.

## Expected evidence

'Users can upload a photo' -> functional; 'p99 read latency under 200ms' -> nonFunctional

## Hints

- Ask whether the statement could be satisfied by a feature, or only by an architectural property.
- Anything with a number attached to time, availability, or scale is almost always non-functional.

## Sources and practice

- [Site Reliability Engineering — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [Study Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/classify-requirements)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
