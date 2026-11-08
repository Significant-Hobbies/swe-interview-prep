# Separate maker claims from checker evidence

> Implement checkerVerdict(contract, makerReport, observations). contract contains requiredChecks and maxChangedFiles. observations contains independently observed checks and changedFiles. Return {accepted, missing, reasons}. Acceptance must depend only on the contract and observations, never on makerReport.claimedPassed. A required check passes only when observations records it as 'passed'.

Canonical: https://learn.significanthobbies.com/curriculum/drills/separate-maker-and-checker

Implement checkerVerdict(contract, makerReport, observations). contract contains requiredChecks and maxChangedFiles. observations contains independently observed checks and changedFiles. Return {accepted, missing, reasons}. Acceptance must depend only on the contract and observations, never on makerReport.claimedPassed. A required check passes only when observations records it as 'passed'.

## The mechanism

The maker proposes a change; the checker reconstructs the contract and gathers fresh evidence. Independence means the checker does not merely repeat the maker's reasoning or accept its claimed test result. Release requires both an artifact and externally reproducible evidence against explicit criteria.

## Expected evidence

An independent acceptance verdict that cannot be fooled by a producer's unsupported claim.

## Hints

- Use the maker report for context only; derive the verdict from fresh observations.
- Report every missing check and the change-budget violation so remediation is actionable.

## Sources and practice

- [Anthropic — Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/)
- [Study Independent Agent Verification](https://learn.significanthobbies.com/curriculum/concepts/independent-agent-verification)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/separate-maker-and-checker)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
