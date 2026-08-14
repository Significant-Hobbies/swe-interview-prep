# Top-k Pruning (WAND)

WAND, MaxScore, and block-max — skipping documents that cannot reach the top k.

- Difficulty: advanced
- Tracks: Search & IR

## Mental model

Scoring every posting is wasted work when you only need the top k: once the heap holds k results, any document whose best possible score cannot exceed the current threshold can be skipped without computing it. WAND does this by keeping a per-term upper bound and advancing pointers past documents whose summed bounds fall short; block-max sharpens it by storing a maximum per block rather than per term, so the bound is tight enough to skip far more. This is safe pruning — the top k is identical to the exhaustive answer, only faster.

## Where it matters

The reason Lucene and Tantivy answer top-10 queries over billions of postings in milliseconds.

## Common mistakes

- Confusing safe pruning with approximate retrieval; WAND returns exactly the same top k
- Using a global per-term upper bound when block-level maxima would prune an order of magnitude more
- Assuming pruning helps for a query needing deep result sets — the win shrinks as k grows
- Forgetting the threshold only rises once the heap is full, so early postings are still scored

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Skip documents that cannot reach the top k

Implement prune(docs, upperBounds, k) where docs is [{id, terms:[termName], score}] and upperBounds maps term -> max possible contribution. Walk docs in order maintaining a top-k heap; BEFORE scoring a document, skip it when the sum of its terms' upper bounds is <= the current k-th best score. Return { top: ids of the top k by score descending, scored: how many documents you actually scored }.

**Expected evidence:** Pruning must not change the top k — only how many documents were scored.

## Review prompts

- WAND skips documents without scoring them. Why is the returned top-k still exactly the same as an exhaustive scan, and when does the technique stop paying off?


## Prerequisites

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25)

## Related concepts

- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index)
- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
