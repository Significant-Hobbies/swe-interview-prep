# Leader election walkthrough

> Walk through Raft leader election: timeouts, candidacy, vote granting, split votes. Trace what happens when the current leader is partitioned from a majority.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-leader-election

Walk through Raft leader election: timeouts, candidacy, vote granting, split votes. Trace what happens when the current leader is partitioned from a majority.

## The mechanism

Consensus is how a cluster agrees on one value despite crashes and network delays. Raft makes it understandable: elect a leader, replicate an append-only log, and a write commits once a majority (quorum) has it. A majority guarantees any two quorums overlap.

## Expected evidence

A 3-node trace showing one election cycle, including a split-vote retry.

## Hints

- Randomized election timeouts break split-vote loops.
- Majority quorum, not consensus, is what guarantees safety.

## Sources and practice

- [The Raft Consensus Algorithm](https://raft.github.io/)
- [Study Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-leader-election)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
