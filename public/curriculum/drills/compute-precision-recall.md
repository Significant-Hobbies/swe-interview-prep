# Compute precision and recall by hand

> Given retrieved doc ids [1,4,2,9] and relevant ids {2,4,7}, compute precision@4 and recall@4.

Canonical: https://learn.significanthobbies.com/curriculum/drills/compute-precision-recall

Given retrieved doc ids [1,4,2,9] and relevant ids {2,4,7}, compute precision@4 and recall@4.

## The mechanism

Precision/recall measure set quality; MRR rewards getting one right answer near the top; nDCG rewards graded relevance discounted by rank. Pick the metric that matches what users feel.

## Expected evidence

precision@4 = 0.5 (2 relevant in 4), recall@4 = 2/3.

## Hints

- Precision = relevant retrieved / total retrieved.
- Recall = relevant retrieved / total relevant in corpus.

## Sources and practice

- [Introduction to Information Retrieval (Manning et al.) — §8.4 Evaluation of ranked retrieval results](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html)
- [Study Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/compute-precision-recall)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
