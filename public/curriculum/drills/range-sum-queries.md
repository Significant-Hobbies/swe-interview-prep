# Answer range-sum queries in O(1)

> Implement makeRangeSum(nums) returning a function query(i, j) that gives the inclusive sum of nums[i..j] in O(1) per call. Build the prefix array once.

Canonical: https://learn.significanthobbies.com/curriculum/drills/range-sum-queries

Implement makeRangeSum(nums) returning a function query(i, j) that gives the inclusive sum of nums[i..j] in O(1) per call. Build the prefix array once.

## The mechanism

A prefix array trades one O(n) pass for O(1) range answers afterwards: sum(i..j) becomes prefix[j+1] - prefix[i]. The generalisation matters more than the trick — any associative, invertible operation works, and the difference array is the same idea run backwards, letting you apply many range updates in O(1) each and materialise the result once.

## Expected evidence

const q = makeRangeSum([1,2,3,4,5]); q(1,3) -> 9; q(0,4) -> 15

## Hints

- Build prefix of length n+1 so prefix[0] = 0 and you never special-case i === 0.
- Inclusive sum(i..j) is prefix[j+1] - prefix[i].

## Sources and practice


- [Study Prefix Sums](https://learn.significanthobbies.com/curriculum/concepts/prefix-sums)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/range-sum-queries)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
