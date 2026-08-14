# Prefix Sums

Precomputed cumulative arrays that turn repeated range queries into O(1) lookups.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

A prefix array trades one O(n) pass for O(1) range answers afterwards: sum(i..j) becomes prefix[j+1] - prefix[i]. The generalisation matters more than the trick — any associative, invertible operation works, and the difference array is the same idea run backwards, letting you apply many range updates in O(1) each and materialise the result once.

## Where it matters

Range queries in analytics, 2D image integral images, and the setup step for many subarray problems.

## Common mistakes

- Off-by-one from mixing inclusive and exclusive bounds — fix the convention once and keep it
- Using it for min or max, which are associative but NOT invertible, so subtraction is meaningless (use a sparse table instead)
- Rebuilding the prefix array inside the query loop, which throws away the whole benefit
- Overflow on long integer ranges when the running sum exceeds the element type

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Answer range-sum queries in O(1)

Implement makeRangeSum(nums) returning a function query(i, j) that gives the inclusive sum of nums[i..j] in O(1) per call. Build the prefix array once.

**Expected evidence:** const q = makeRangeSum([1,2,3,4,5]); q(1,3) -> 9; q(0,4) -> 15

## Review prompts

- Prefix sums answer range-sum in O(1). Why does the same trick fail for range-minimum, and what does that tell you about which operations it works for?


## Prerequisites

- [Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis)

## Related concepts

- [Sliding Window](https://learn.significanthobbies.com/curriculum/concepts/sliding-window)
- [Two Pointers](https://learn.significanthobbies.com/curriculum/concepts/two-pointers)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
