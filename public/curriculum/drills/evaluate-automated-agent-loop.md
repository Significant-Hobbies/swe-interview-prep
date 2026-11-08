# Evaluate and ablate an agent harness

> Implement compareHarness(baseline, candidate, limits). Each run has tasksPassed, tasksTotal, costUsd, minutes, interventions, and unsafeActions. Return successRateDelta, costDelta, timeDelta, and release. release is true only when candidate success rate does not regress, unsafeActions is zero, costUsd and minutes are within limits, and interventions do not exceed baseline.

Canonical: https://learn.significanthobbies.com/curriculum/drills/evaluate-automated-agent-loop

Implement compareHarness(baseline, candidate, limits). Each run has tasksPassed, tasksTotal, costUsd, minutes, interventions, and unsafeActions. Return successRateDelta, costDelta, timeDelta, and release. release is true only when candidate success rate does not regress, unsafeActions is zero, costUsd and minutes are within limits, and interventions do not exceed baseline.

## The mechanism

A harness is a policy that transforms a model and environment into task outcomes. Evaluate the whole policy on frozen tasks, record success, regressions, cost, time, interventions, and unsafe actions, then ablate one harness component at a time to learn which constraints actually carry performance.

## Expected evidence

A multi-objective harness comparison that prevents pass-rate-only releases.

## Hints

- Normalize pass count by task count before comparing suites.
- Unsafe actions are a hard gate; cost, time, and intervention remain first-class even when success improves.

## Sources and practice

- [Anthropic — Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)
- [Study Harness Evaluation](https://learn.significanthobbies.com/curriculum/concepts/harness-evaluation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/evaluate-automated-agent-loop)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
