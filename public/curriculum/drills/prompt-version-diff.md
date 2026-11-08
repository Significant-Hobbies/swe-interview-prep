# Diff two prompt versions

> v1 and v2 prompts differ by one instruction. Name what you must re-run before shipping v2.

Canonical: https://learn.significanthobbies.com/curriculum/drills/prompt-version-diff

v1 and v2 prompts differ by one instruction. Name what you must re-run before shipping v2.

## The mechanism

Treat prompts like code — every production change gets a version, a saved diff, and a re-run of your evals. Without that, when quality drops you have no commit to point at.

## Expected evidence

Frozen eval set on both versions; compare pass rate delta.

## Hints

- Prompts are code — version them.
- Never ship without eval diff.

## Sources and practice

- [PostHog — LLM analytics](https://posthog.com/docs/ai-engineering)
- [Study Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/prompt-version-diff)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
