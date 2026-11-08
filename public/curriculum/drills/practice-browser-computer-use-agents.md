# Design exercise: Browser & Computer-use Agents

> DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation. Implement designOutline() returning non-empty values for: observation, boundedAction, stateVerification. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-browser-computer-use-agents

DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation. Implement designOutline() returning non-empty values for: observation, boundedAction, stateVerification. Each value must name a concrete mechanism or decision.

## The mechanism

Computer use is closed-loop control: observe current state, choose one bounded action, execute, verify the resulting state, and recover from drift.

## Expected evidence

A design outline with observation, boundedAction, stateVerification plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://arxiv.org/abs/2307.13854)
- [Mind2Web: Towards a Generalist Agent for the Web](https://arxiv.org/abs/2306.06070)
- [OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments](https://arxiv.org/abs/2404.07972)
- [Developing a Computer Use Model (Anthropic)](https://www.anthropic.com/news/developing-computer-use)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Study Browser & Computer-use Agents](https://learn.significanthobbies.com/curriculum/concepts/browser-computer-use-agents)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-browser-computer-use-agents)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
