# News feed (Twitter-style)

> Design a home timeline feed: who you follow → posts you see, ranked recency-first. Compare fan-out-on-write vs fan-out-on-read. Address celebrity-follower asymmetry.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-news-feed

Design a home timeline feed: who you follow → posts you see, ranked recency-first. Compare fan-out-on-write vs fan-out-on-read. Address celebrity-follower asymmetry.

## The mechanism

Feed systems pick between two strategies: precompute each follower's feed when you post (fan-out on write), or assemble it at request time (fan-out on read). The real-world answer is usually hybrid — fan-out-on-write fails for celebrities, fan-out-on-read fails for the long tail.

## Expected evidence

Hybrid fan-out strategy + storage layout + a back-of-envelope read/write QPS estimate.

## Hints

- Celebrities (>1M followers) break pure fan-out-on-write.
- A feed cache that is 80% pre-computed is usually enough.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Feeding Frenzy: Selectively Materializing Users' Event Feeds (SIGMOD 2010)](https://jeffterrace.com/docs/feeding-frenzy-sigmod10-web.pdf)
- [Meta Engineering — News Feed ranking](https://engineering.fb.com/2021/01/26/ml-applications/news-feed-ranking/)
- [TAO: Facebook's Distributed Data Store for the Social Graph (ATC '13)](https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson)
- [Study Feed Systems](https://learn.significanthobbies.com/curriculum/concepts/social-media)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-news-feed)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
