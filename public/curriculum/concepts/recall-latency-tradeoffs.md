# Recall / Latency Tradeoffs

Reading recall-vs-latency curves to choose ANN parameters.

- Difficulty: advanced
- Tracks: Vector DB & ANN

## Mental model

Every ANN knob trades recall for speed/memory. The honest artifact is a curve: recall on the y-axis, latency (or QPS, or memory) on the x-axis, with brute force as the recall=1.0 anchor.

## Where it matters

ann-benchmarks.com, every vector DB selection decision.

## Common mistakes

- Reporting a single recall number with no latency context
- Comparing indexes at different recall operating points

## Primary sources

- [ANN-Benchmarks](https://ann-benchmarks.com/) (article)

## Practice

### Read a recall–latency curve

ANN curve: 95% recall @ 8ms, 99% @ 25ms, brute force 100% @ 200ms. Which point do you ship for interactive search?

**Expected evidence:** 95%/8ms if UX budget ~10ms; document regression vs brute force.

## Review prompts

- Why report a recall/latency curve instead of a single recall number?

## Build evidence

- **Recall / latency benchmark dashboard** — Plot recall vs latency for ANN parameter sweeps against the brute-force baseline.

## Prerequisites

- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw.html)

## Related concepts

- [IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf.html)
- [Product Quantization](https://learn.significanthobbies.com/curriculum/concepts/product-quantization.html)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
