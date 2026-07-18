# ADR 0005: Socratic AI never gives direct solutions

Date: 2026-04
Status: Accepted

## Context

The AI companion sits beside the user while they drill and build. The
product's learning thesis is that recall and explain-back (Feynman Gate) are
what produce mastery — handing out answers would short-circuit the loop and
make the AI a crutch.

## Decision

`CompanionPanel.tsx` and the `/api/chat` Socratic system prompt never give
direct solutions. They only probe understanding: ask what the user has tried,
what they expect, what tradeoffs they're considering.

## Alternatives considered

- **Toggleable spoiler mode.** Rejected: the default must teach the habit of
  explaining, not the habit of asking for the answer.

## Consequences

- This is **intentional product behavior — do not change it** without
  reversing this ADR. Agents editing `CompanionPanel.tsx` or the chat system
  prompt must preserve the no-solutions constraint.
- The Feynman Gate is the place where the user's own explanation is graded,
  not where the AI supplies the answer.
