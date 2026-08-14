# Independent Agent Verification

Maker-checker role separation, independent evidence gathering, adversarial review, and acceptance gates that do not trust the producer's self-report.

- Difficulty: advanced
- Tracks: Agent Systems, Evaluation & AI Reliability

## Mental model

The maker proposes a change; the checker reconstructs the contract and gathers fresh evidence. Independence means the checker does not merely repeat the maker's reasoning or accept its claimed test result. Release requires both an artifact and externally reproducible evidence against explicit criteria.

## Where it matters

Agent-generated pull requests, evaluator agents, security review, visual regression, acceptance tests, and policy gates.

## Common mistakes

- Asking the same context to review its own work without fresh evidence
- Using lint success as proof of user-facing or semantic correctness
- Letting a checker rewrite the work before clearly reporting the failed acceptance criterion

## Primary sources

- [Anthropic — Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) (article)
- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/) (article)

## Practice

### Separate maker claims from checker evidence

Implement checkerVerdict(contract, makerReport, observations). contract contains requiredChecks and maxChangedFiles. observations contains independently observed checks and changedFiles. Return {accepted, missing, reasons}. Acceptance must depend only on the contract and observations, never on makerReport.claimedPassed. A required check passes only when observations records it as 'passed'.

**Expected evidence:** An independent acceptance verdict that cannot be fooled by a producer's unsupported claim.

## Review prompts

- A maker agent says it ran all tests and asks a checker agent to approve the change. What makes the check independent rather than another self-review?

## Build evidence

- **Build a Complete Coding-Agent Harness** — Build a repository-local harness that can take one bounded engineering task from initialization through implementation, verification, durable handoff, and explicit termination without relying on hidden machine state or chat memory.
- **Automate and Evaluate a Maker-Checker Loop** — Automate a bounded loop in which a maker attempts one task, an independent checker evaluates explicit acceptance criteria, failures return actionable evidence, and the orchestrator stops on success, escalation, cancellation, or budget exhaustion. Compare it with a baseline harness on a frozen task suite.

## Prerequisites

- [Agent Scope Control](https://learn.significanthobbies.com/curriculum/concepts/agent-scope-control)
- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing)

## Related concepts

- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability)
- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems)
- [Harness Evaluation](https://learn.significanthobbies.com/curriculum/concepts/harness-evaluation)

## Learning paths

- [Harness Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/harness-engineering)
