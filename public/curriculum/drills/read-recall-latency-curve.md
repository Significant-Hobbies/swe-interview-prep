# Read a recall–latency curve

> ANN curve: 95% recall @ 8ms, 99% @ 25ms, brute force 100% @ 200ms. Which point do you ship for interactive search?

Canonical: https://learn.significanthobbies.com/curriculum/drills/read-recall-latency-curve

ANN curve: 95% recall @ 8ms, 99% @ 25ms, brute force 100% @ 200ms. Which point do you ship for interactive search?

## The mechanism

Every ANN knob trades recall for speed/memory. The honest artifact is a curve: recall on the y-axis, latency (or QPS, or memory) on the x-axis, with brute force as the recall=1.0 anchor.

## Expected evidence

95%/8ms if UX budget ~10ms; document regression vs brute force.

## Hints

- Plot recall on Y, latency on X.
- Brute force anchors truth.

## Sources and practice

- [ANN-Benchmarks](https://ann-benchmarks.com/)
- [Study Recall / Latency Tradeoffs](https://learn.significanthobbies.com/curriculum/concepts/recall-latency-tradeoffs)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/read-recall-latency-curve)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
