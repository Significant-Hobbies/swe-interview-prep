# Reliability & Fault Tolerance

SLOs, error budgets, redundancy, graceful degradation, overload control, and failure-domain design.

- Difficulty: core
- Tracks: Infrastructure & Platforms

## Mental model

Reliability is a measurable product property. Define an SLO, budget failure, isolate fault domains, shed optional work, and test recovery before incidents. Scope: this card owns the target-setting layer — deciding what 'reliable enough' means and budgeting for it with SLOs, error budgets and fault domains. Staying CORRECT while a request is failing is `distributed-failure-recovery`; the concrete queue-retry mechanism is `retries-dlq`.



## Primary sources

- [Google Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/) (doc)

## Practice

### Design exercise: Reliability & Fault Tolerance

SLOs, error budgets, redundancy, graceful degradation, overload control, and failure-domain design. Implement designOutline() returning non-empty values for: slo, failureDomain, degradationMode. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with slo, failureDomain, degradationMode plus an explicit failure mode or trade-off.

## Review prompts

- What is an error budget for, and what should happen when it is exhausted?

## Build evidence

- **Synthesize: Infrastructure & Platforms** — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs.html)

## Related concepts

- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs.html)
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq.html)

## Learning paths

- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w.html)
