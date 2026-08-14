# IDE & CLI Tooling

Language servers, editor protocols, terminal UX, diagnostics, completions, commands, configuration, and automation.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

Good developer tools expose a stable core through both structured APIs and human interfaces. Fast feedback, composability, discoverability, and predictable exit behavior matter.



## Primary sources

- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/) (doc)
- [Debug Adapter Protocol — overview](https://microsoft.github.io/debug-adapter-protocol/overview) (doc)
- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/) (doc)
- [ripgrep is faster than {grep, ag, git grep, ucg, pt, sift}](https://blog.burntsushi.net/ripgrep/) (article)
- [Tree-sitter — Using Parsers](https://tree-sitter.github.io/tree-sitter/using-parsers/) (doc)

## Practice

### Design exercise: IDE & CLI Tooling

Language servers, editor protocols, terminal UX, diagnostics, completions, commands, configuration, and automation. Implement designOutline() returning non-empty values for: protocol, feedbackLoop, automationContract. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with protocol, feedbackLoop, automationContract plus an explicit failure mode or trade-off.

## Review prompts

- What does the language-server architecture decouple, and what problem does that solve?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence)

## Related concepts

- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence)
- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w)
