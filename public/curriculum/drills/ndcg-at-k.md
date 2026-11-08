# NDCG@k

> Implement ndcgAtK(relevances, k) where relevances are graded gains in RANKED order. DCG = sum over i of rel_i / log2(i + 2) for i from 0. IDCG uses the same relevances sorted descending. Return DCG/IDCG rounded to 4 decimals, or 0 when IDCG is 0.

Canonical: https://learn.significanthobbies.com/curriculum/drills/ndcg-at-k

Implement ndcgAtK(relevances, k) where relevances are graded gains in RANKED order. DCG = sum over i of rel_i / log2(i + 2) for i from 0. IDCG uses the same relevances sorted descending. Return DCG/IDCG rounded to 4 decimals, or 0 when IDCG is 0.

## The mechanism

Ranking quality is measured by NDCG, which depends on sort order and therefore has zero gradient almost everywhere — so learning-to-rank is largely the story of optimising something else that correlates. Pointwise regression ignores that only relative order matters; pairwise methods learn 'a should outrank b' and get much closer; LambdaMART's trick is to weight each pair by how much swapping it would change NDCG, smuggling the real metric into the gradient without ever differentiating it.

## Expected evidence

ndcgAtK([3,2,3,0,1,2],6) -> 0.9608

## Hints

- The discount is log2(rank+1) with ranks starting at 1, i.e. log2(i+2) for zero-based i.
- IDCG is the best achievable ordering of the SAME relevance values, truncated to k as well.

## Sources and practice


- [Study Learning to Rank](https://learn.significanthobbies.com/curriculum/concepts/learning-to-rank)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ndcg-at-k)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
