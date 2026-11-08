# IVF nprobe vs recall

> 100k vectors, 1000 centroids, nprobe=1 recalls 70%, nprobe=8 recalls 92%. Latency 2ms→9ms. Pick nprobe for prod if SLA is 5ms and recall target 85%.

Canonical: https://learn.significanthobbies.com/curriculum/drills/ivf-nprobe-recall

100k vectors, 1000 centroids, nprobe=1 recalls 70%, nprobe=8 recalls 92%. Latency 2ms→9ms. Pick nprobe for prod if SLA is 5ms and recall target 85%.

## The mechanism

IVF partitions the space into Voronoi cells via k-means. A query is matched to its nearest cells (nprobe of them) and only those vectors are scanned — trading recall for a big speedup.

## Expected evidence

nprobe=8 exceeds recall but misses SLA; try nprobe=4 and measure curve.

## Hints

- More cells scanned → higher recall, higher latency.

## Sources and practice

- [Pinecone — IVF index](https://www.pinecone.io/learn/series/faiss/vector-indexes/)
- [Study IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ivf-nprobe-recall)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
