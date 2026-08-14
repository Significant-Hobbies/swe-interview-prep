# Combinatorics

Counting without enumerating — permutations, combinations, inclusion-exclusion, pigeonhole.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Every counting problem is a question about whether order matters and whether repetition is allowed; get those two right and the formula follows. Inclusion-exclusion exists because naive addition double-counts overlaps, and the pigeonhole principle is the one tool that proves something must exist without constructing it — which is why it shows up in hash-collision and cache arguments rather than in counting exercises.

## Where it matters

Collision probability, birthday-paradox reasoning about id spaces, and the state-space estimates behind DP problems.

## Common mistakes

- Using a permutation where order does not matter, inflating the count by k!
- Adding the sizes of overlapping sets without subtracting the intersection
- Treating 'at least one' directly instead of counting the complement, which is usually far easier
- Assuming outcomes are equally likely when the sample space was constructed unevenly

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Count with inclusion-exclusion

Implement countDivisible(n, divisors) — how many integers in 1..n are divisible by AT LEAST ONE of the divisors. Use inclusion-exclusion over every non-empty subset, adding odd-sized subsets and subtracting even-sized ones, with lcm for each subset.

**Expected evidence:** countDivisible(100,[3,5]) -> 47 (33 + 20 - 6)

## Review prompts

- 'At least one collision among k hashed items' is awkward to count directly. What is the standard move, and why is it easier?


## Prerequisites

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals)

## Related concepts

- [Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory)
- [1D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-1d)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
