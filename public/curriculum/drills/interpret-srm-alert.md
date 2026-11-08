# Interpret a sample ratio mismatch

> Planned 50/50 split; after 24h you observe 52% control / 48% treatment (n=100k total). χ² test flags SRM at p=0.001. What do you do before trusting the CTR lift?

Canonical: https://learn.significanthobbies.com/curriculum/drills/interpret-srm-alert

Planned 50/50 split; after 24h you observe 52% control / 48% treatment (n=100k total). χ² test flags SRM at p=0.001. What do you do before trusting the CTR lift?

## The mechanism

An A/B test is a hypothesis test with a deployment budget. Power asks whether you'd detect a real effect; practical significance asks whether the effect matters; SRM catches broken randomization before you trust the p-value.

## Expected evidence

Stop the test readout; investigate bucketing bugs, bot traffic, locale skew, or deployment issues. Do not ship on a broken randomization.

## Hints

- SRM means the assignment mechanism is wrong.
- Effect estimates are biased under SRM.

## Sources and practice

- [Evan Miller — Sample Size Calculator](https://www.evanmiller.org/ab-testing/sample-size.html)
- [Microsoft ExP platform paper](https://arxiv.org/abs/1803.03218)
- [Spotify — New Experimentation Platform, Part 2 (validity checks & SRM)](https://engineering.atspotify.com/2020/11/spotifys-new-experimentation-platform-part-2)
- [Study A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/interpret-srm-alert)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
