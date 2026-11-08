# Design exercise: Reliability & Fault Tolerance

> SLOs, error budgets, redundancy, graceful degradation, overload control, and failure-domain design. Implement designOutline() returning non-empty values for: slo, failureDomain, degradationMode. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-reliability-fault-tolerance

SLOs, error budgets, redundancy, graceful degradation, overload control, and failure-domain design. Implement designOutline() returning non-empty values for: slo, failureDomain, degradationMode. Each value must name a concrete mechanism or decision.

## The mechanism

Reliability is a measurable product property. Define an SLO, budget failure, isolate fault domains, shed optional work, and test recovery before incidents. Scope: this card owns the target-setting layer — deciding what 'reliable enough' means and budgeting for it with SLOs, error budgets and fault domains. Staying CORRECT while a request is failing is `distributed-failure-recovery`; the concrete queue-retry mechanism is `retries-dlq`.

## Expected evidence

A design outline with slo, failureDomain, degradationMode plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Google Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)
- [Study Reliability & Fault Tolerance](https://learn.significanthobbies.com/curriculum/concepts/reliability-fault-tolerance)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-reliability-fault-tolerance)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
