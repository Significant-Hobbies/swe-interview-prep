# Embedded Learning Library

The Learning Library embeds maintained open-source GitHub repositories without copying their
content into a separate editorial system. `pnpm fetch-library` clones each source, normalizes its
hierarchy, rewrites media references, rebuilds review-question indexes, and records refresh
metadata. Generated content must only be changed through the config or generator.

## Inclusion standard

A repository belongs here when it is actively useful for a Fleet learning track, legally reusable,
substantive enough to study inside the reader, and materially different from existing sources.
Popularity is supporting evidence, not the deciding criterion. Link collections need a coherent
learning purpose; inactive, archived, paywall-first, and duplicative repositories stay out.

## Current sources

| Repository | Role in the library |
| --- | --- |
| JavaScript Interview Questions | Broad JavaScript recall and gap checks |
| React Interview Questions | React-specific recall from fundamentals to rendering behavior |
| Frontend Interview Handbook | Frontend coding, trivia, and system-design preparation |
| System Design | Sequential distributed-systems fundamentals |
| System Design 101 | Visual production architecture explanations |
| Awesome Low-Level Design | Design patterns, UML, and LLD case studies |
| Grokking OOP Design | Compact classic object-design walkthroughs |
| DevOps Exercises | Active recall across Linux, cloud, containers, and operations |
| Coding Interview Patterns | Algorithm solutions organized by 19 reusable patterns |
| OOD Interview | Runnable Java projects, tests, and UML for common OOD prompts |
| System Design Primer | Deep system-design curriculum plus spaced-repetition material |
| JavaScript Algorithms | Explained data structures and algorithms with JavaScript implementations |
| Tech Interview Handbook | Coding strategy, behavioral, resume, and interview-loop preparation |
| Project-Based Learning | Applied tutorials that turn reading into real software projects |

The last two sources were added after comparing other high-quality open repositories. Coding
Interview University was not added because it substantially overlaps the existing interview and
system-design paths. OSSU Computer Science and Developer Roadmap were not added because they are
primarily external curriculum indexes rather than content suited to this embedded reader. Data
Engineering Zoomcamp remains a strong future candidate when a dedicated data-engineering track
exists.

## Maintenance

Run `pnpm fetch-library`, inspect manifest count changes and generated diffs, then run the library
invariants, lint, typecheck, tests, build, and desktop/mobile reader QA. A failed or empty upstream
parse retains the previous generated source instead of silently dropping it.
