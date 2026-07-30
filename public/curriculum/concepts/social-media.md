# Feed Systems

Fan-out write/read, timeline.

- Difficulty: core
- Tracks: System Design

## Mental model

Feed systems pick between two strategies: precompute each follower's feed when you post (fan-out on write), or assemble it at request time (fan-out on read). The real-world answer is usually hybrid — fan-out-on-write fails for celebrities, fan-out-on-read fails for the long tail.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [Feeding Frenzy: Selectively Materializing Users' Event Feeds (SIGMOD 2010)](https://jeffterrace.com/docs/feeding-frenzy-sigmod10-web.pdf) (paper)
- [Meta Engineering — News Feed ranking](https://engineering.fb.com/2021/01/26/ml-applications/news-feed-ranking/) (article)
- [TAO: Facebook's Distributed Data Store for the Social Graph (ATC '13)](https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson) (paper)

## Practice

### News feed (Twitter-style)

Design a home timeline feed: who you follow → posts you see, ranked recency-first. Compare fan-out-on-write vs fan-out-on-read. Address celebrity-follower asymmetry.

**Expected evidence:** Hybrid fan-out strategy + storage layout + a back-of-envelope read/write QPS estimate.

## Review prompts

- Describe the hybrid feed strategy and say exactly where the merge happens.


## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html)
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching.html)
- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues.html)

## Related concepts

- None assigned.

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
