# Repository Intelligence

Structure, symbols, history, ownership, conventions, architecture, semantic search, and change-aware retrieval.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

Repository intelligence answers what exists, why it exists, who depends on it, and what changed. It combines indexed code, graphs, history, and local instructions.



## Primary sources

- [GitHub Code Search Syntax](https://docs.github.com/en/search-github/github-code-search/understanding-github-code-search-syntax) (doc)
- [Software Engineering at Google — Ch. 17: Code Search](https://abseil.io/resources/swe-book/html/ch17.html) (doc)
- [Regular Expression Matching with a Trigram Index (Russ Cox)](https://swtch.com/~rsc/regexp/regexp4.html) (article)
- [The technology behind GitHub's new code search (Blackbird)](https://github.blog/engineering/the-technology-behind-githubs-new-code-search/) (article)
- [CodeSearchNet Challenge: Evaluating Semantic Code Search](https://arxiv.org/abs/1909.09436) (paper)

## Practice

### Design exercise: Repository Intelligence

Structure, symbols, history, ownership, conventions, architecture, semantic search, and change-aware retrieval. Implement designOutline() returning non-empty values for: index, retrieval, contextAssembly. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with index, retrieval, contextAssembly plus an explicit failure mode or trade-off.

## Review prompts

- Why is embedding-based semantic search insufficient on its own for repository questions?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Dependency & Blast-radius Analysis](https://learn.significanthobbies.com/curriculum/concepts/dependency-blast-radius)

## Related concepts

- [Dependency & Blast-radius Analysis](https://learn.significanthobbies.com/curriculum/concepts/dependency-blast-radius)
- [IDE & CLI Tooling](https://learn.significanthobbies.com/curriculum/concepts/ide-cli-tooling)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w)
