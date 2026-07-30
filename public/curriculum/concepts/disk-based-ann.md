# Disk-Based ANN

DiskANN and SPANN — serving vector indexes that do not fit in memory.

- Difficulty: advanced
- Tracks: Vector DB & ANN

## Mental model

An in-memory graph index like HNSW is bounded by RAM, so at billion scale the index has to live on SSD — and then the cost model inverts: what matters is not comparisons but the number of random reads, because each one costs a hundred microseconds. DiskANN's answer is to keep compressed vectors in memory to guide the search and touch the SSD only for the few full-precision neighbourhoods it actually needs, so a query costs a handful of reads rather than a traversal's worth.

## Where it matters

Billion-scale retrieval on commodity hardware, where an all-in-RAM index would cost an order of magnitude more.

## Common mistakes

- Carrying over in-memory intuition and optimising comparison count instead of I/O count
- Ignoring that SSD random-read latency, not bandwidth, sets the query floor
- Rebuilding the whole index for small update volumes rather than maintaining a delta
- Benchmarking with a warm page cache, which hides the disk cost entirely

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Cost a disk-resident search by I/O

Implement queryCost({hops, neighboursPerHop, cachedFraction, readLatencyUs, compareLatencyNs}) returning { randomReads, totalUs } rounded to 2 decimals. Every hop fetches neighboursPerHop nodes; a cachedFraction of them avoid the SSD. Comparisons cost compareLatencyNs each and happen for every fetched neighbour.

**Expected evidence:** With SSD reads at 100us, I/O dominates comparisons by orders of magnitude.

## Review prompts

- Moving an ANN index from RAM to SSD inverts what you optimise. What becomes the cost, and how does DiskANN keep it low?


## Prerequisites

- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw.html)

## Related concepts

- [Scalar & Binary Quantization](https://learn.significanthobbies.com/curriculum/concepts/vector-quantization.html)
- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
