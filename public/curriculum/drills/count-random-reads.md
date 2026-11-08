# Cost a disk-resident search by I/O

> Implement queryCost({hops, neighboursPerHop, cachedFraction, readLatencyUs, compareLatencyNs}) returning { randomReads, totalUs } rounded to 2 decimals. Every hop fetches neighboursPerHop nodes; a cachedFraction of them avoid the SSD. Comparisons cost compareLatencyNs each and happen for every fetched neighbour.

Canonical: https://learn.significanthobbies.com/curriculum/drills/count-random-reads

Implement queryCost({hops, neighboursPerHop, cachedFraction, readLatencyUs, compareLatencyNs}) returning { randomReads, totalUs } rounded to 2 decimals. Every hop fetches neighboursPerHop nodes; a cachedFraction of them avoid the SSD. Comparisons cost compareLatencyNs each and happen for every fetched neighbour.

## The mechanism

An in-memory graph index like HNSW is bounded by RAM, so at billion scale the index has to live on SSD — and then the cost model inverts: what matters is not comparisons but the number of random reads, because each one costs a hundred microseconds. DiskANN's answer is to keep compressed vectors in memory to guide the search and touch the SSD only for the few full-precision neighbourhoods it actually needs, so a query costs a handful of reads rather than a traversal's worth.

## Expected evidence

With SSD reads at 100us, I/O dominates comparisons by orders of magnitude.

## Hints

- randomReads = hops * neighboursPerHop * (1 - cachedFraction); do not round it away before costing it.
- Convert nanoseconds to microseconds before adding, or the comparison term vanishes.

## Sources and practice


- [Study Disk-Based ANN](https://learn.significanthobbies.com/curriculum/concepts/disk-based-ann)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/count-random-reads)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
