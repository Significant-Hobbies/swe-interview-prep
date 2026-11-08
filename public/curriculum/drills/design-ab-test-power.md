# Design an A/B test with power

> You want to test a new ranking model on search CTR (baseline 8%, hope for +0.5pp). Define: primary metric, MDE, α, target power, estimated n per arm, duration given 50k daily users split 50/50, peeking policy, and guardrail metrics.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-ab-test-power

You want to test a new ranking model on search CTR (baseline 8%, hope for +0.5pp). Define: primary metric, MDE, α, target power, estimated n per arm, duration given 50k daily users split 50/50, peeking policy, and guardrail metrics.

## The mechanism

An A/B test is a hypothesis test with a deployment budget. Power asks whether you'd detect a real effect; practical significance asks whether the effect matters; SRM catches broken randomization before you trust the p-value.

## Expected evidence

A one-page test plan with n≈7k+ per arm (similar proportion formula), ~3–4 days runtime, no peeking until fixed n, guardrails on latency and null-result rate.

## Hints

- One primary metric; everything else is diagnostic.
- Pre-register stopping rule before launch.

## Sources and practice

- [Evan Miller — Sample Size Calculator](https://www.evanmiller.org/ab-testing/sample-size.html)
- [Microsoft ExP platform paper](https://arxiv.org/abs/1803.03218)
- [Spotify — New Experimentation Platform, Part 2 (validity checks & SRM)](https://engineering.atspotify.com/2020/11/spotifys-new-experimentation-platform-part-2)
- [Study A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-ab-test-power)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
