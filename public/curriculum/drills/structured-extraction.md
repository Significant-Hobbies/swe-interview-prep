# Schema-constrained extraction

> Define a JSON schema and use structured-output mode to extract typed fields from unstructured text. Validate the result and reject on failure.

Canonical: https://learn.significanthobbies.com/curriculum/drills/structured-extraction

Define a JSON schema and use structured-output mode to extract typed fields from unstructured text. Validate the result and reject on failure.

## The mechanism

Free text is unparseable glue between systems. Structured outputs constrain generation to a schema (via grammar/JSON mode) so the model's answer is a typed object your code can trust — or reject.

## Expected evidence

A validated typed object, or an explicit rejection.

## Hints

- Use schema/JSON mode, not regex on prose.
- Always validate before trusting downstream.

## Sources and practice

- [OpenAI — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Study Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/structured-extraction)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
