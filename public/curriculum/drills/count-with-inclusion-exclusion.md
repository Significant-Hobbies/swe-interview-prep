# Count with inclusion-exclusion

> Implement countDivisible(n, divisors) — how many integers in 1..n are divisible by AT LEAST ONE of the divisors. Use inclusion-exclusion over every non-empty subset, adding odd-sized subsets and subtracting even-sized ones, with lcm for each subset.

Canonical: https://learn.significanthobbies.com/curriculum/drills/count-with-inclusion-exclusion

Implement countDivisible(n, divisors) — how many integers in 1..n are divisible by AT LEAST ONE of the divisors. Use inclusion-exclusion over every non-empty subset, adding odd-sized subsets and subtracting even-sized ones, with lcm for each subset.

## The mechanism

Every counting problem is a question about whether order matters and whether repetition is allowed; get those two right and the formula follows. Inclusion-exclusion exists because naive addition double-counts overlaps, and the pigeonhole principle is the one tool that proves something must exist without constructing it — which is why it shows up in hash-collision and cache arguments rather than in counting exercises.

## Expected evidence

countDivisible(100,[3,5]) -> 47   (33 + 20 - 6)

## Hints

- Iterate subsets with a bitmask; lcm(a,b) = a*b/gcd(a,b) applied across the subset.
- Sign is +1 for odd-sized subsets and -1 for even — that is what stops the overlaps being double-counted.

## Sources and practice


- [Study Combinatorics](https://learn.significanthobbies.com/curriculum/concepts/combinatorics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/count-with-inclusion-exclusion)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
