# Design exercise: Infrastructure Automation

> Declarative infrastructure, state, plans, drift detection, policy checks, secrets boundaries, and safe changes. Implement designOutline() returning non-empty values for: desiredState, driftDetection, changeSafety. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-infrastructure-automation

Declarative infrastructure, state, plans, drift detection, policy checks, secrets boundaries, and safe changes. Implement designOutline() returning non-empty values for: desiredState, driftDetection, changeSafety. Each value must name a concrete mechanism or decision.

## The mechanism

Infrastructure automation is a convergent state machine. Desired configuration, observed state, diff, approval, and rollback must all be inspectable.

## Expected evidence

A design outline with desiredState, driftDetection, changeSafety plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Terraform Language Documentation](https://developer.hashicorp.com/terraform/language)
- [Study Infrastructure Automation](https://learn.significanthobbies.com/curriculum/concepts/infrastructure-automation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-infrastructure-automation)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
