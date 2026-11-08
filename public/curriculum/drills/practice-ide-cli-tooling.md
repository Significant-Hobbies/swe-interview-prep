# Design exercise: IDE & CLI Tooling

> Language servers, editor protocols, terminal UX, diagnostics, completions, commands, configuration, and automation. Implement designOutline() returning non-empty values for: protocol, feedbackLoop, automationContract. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-ide-cli-tooling

Language servers, editor protocols, terminal UX, diagnostics, completions, commands, configuration, and automation. Implement designOutline() returning non-empty values for: protocol, feedbackLoop, automationContract. Each value must name a concrete mechanism or decision.

## The mechanism

Good developer tools expose a stable core through both structured APIs and human interfaces. Fast feedback, composability, discoverability, and predictable exit behavior matter.

## Expected evidence

A design outline with protocol, feedbackLoop, automationContract plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)
- [Debug Adapter Protocol — overview](https://microsoft.github.io/debug-adapter-protocol/overview)
- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/)
- [ripgrep is faster than {grep, ag, git grep, ucg, pt, sift}](https://blog.burntsushi.net/ripgrep/)
- [Tree-sitter — Using Parsers](https://tree-sitter.github.io/tree-sitter/using-parsers/)
- [Study IDE & CLI Tooling](https://learn.significanthobbies.com/curriculum/concepts/ide-cli-tooling)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-ide-cli-tooling)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
