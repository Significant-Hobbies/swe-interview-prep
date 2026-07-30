# Learning to Rank

Pointwise, pairwise, and listwise objectives — and why the metric you care about is not differentiable.

- Difficulty: advanced
- Tracks: Search & IR

## Mental model

Ranking quality is measured by NDCG, which depends on sort order and therefore has zero gradient almost everywhere — so learning-to-rank is largely the story of optimising something else that correlates. Pointwise regression ignores that only relative order matters; pairwise methods learn 'a should outrank b' and get much closer; LambdaMART's trick is to weight each pair by how much swapping it would change NDCG, smuggling the real metric into the gradient without ever differentiating it.

## Where it matters

The reranking stage in every production search system, and the reason retrieval and ranking are trained separately.

## Common mistakes

- Training pointwise on graded labels and being surprised the ordering is poor
- Evaluating on a metric the loss never optimised, then tuning the loss to the metric by accident
- Ignoring query-level grouping, so pairs are formed across unrelated queries
- Training on clicks as if they were relevance labels, without correcting for position bias

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### NDCG@k

Implement ndcgAtK(relevances, k) where relevances are graded gains in RANKED order. DCG = sum over i of rel_i / log2(i + 2) for i from 0. IDCG uses the same relevances sorted descending. Return DCG/IDCG rounded to 4 decimals, or 0 when IDCG is 0.

**Expected evidence:** ndcgAtK([3,2,3,0,1,2],6) -> 0.9608

## Review prompts

- NDCG has zero gradient almost everywhere. How does LambdaMART optimise it anyway?


## Prerequisites

- [Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics.html)

## Related concepts

- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking.html)
- [Click Models & Position Bias](https://learn.significanthobbies.com/curriculum/concepts/click-models.html)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
