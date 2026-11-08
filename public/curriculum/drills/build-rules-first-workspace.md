# Build a scoped repository instruction map

> Implement instructionMap() for a repository with a root AGENTS.md and a packages/api/AGENTS.md. Return {root, api, precedence, checks}. root must contain exactly three concise repository-wide invariants. api must contain exactly two API-only refinements and must not repeat a root rule. precedence must explain in at least eight words that nearer instructions refine broader instructions without silently overriding direct task intent. checks must list two runnable validation commands.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-rules-first-workspace

Implement instructionMap() for a repository with a root AGENTS.md and a packages/api/AGENTS.md. Return {root, api, precedence, checks}. root must contain exactly three concise repository-wide invariants. api must contain exactly two API-only refinements and must not repeat a root rule. precedence must explain in at least eight words that nearer instructions refine broader instructions without silently overriding direct task intent. checks must list two runnable validation commands.

## The mechanism

Instructions form a scoped configuration tree. Broad rules establish invariants, nearer files refine behavior for a subtree, and direct task intent supplies the leaf-level objective. A useful instruction is discoverable, non-contradictory, and paired with the command or artifact that proves compliance.

## Expected evidence

A non-duplicative instruction tree with explicit precedence and executable checks.

## Hints

- Put stable invariants high in the tree and package-specific commands near the owned files.
- A validation command is more useful than prose such as 'make sure tests pass'.

## Sources and practice

- [GitHub Docs — Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide)
- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)
- [Study Repository Instruction Topology](https://learn.significanthobbies.com/curriculum/concepts/repository-instruction-topology)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-rules-first-workspace)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
