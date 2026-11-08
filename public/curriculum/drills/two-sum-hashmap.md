# Two Sum with a hash map

> Given an array of integers and a target, return the indices of the two numbers that add to the target. Solve it in a single pass.

Canonical: https://learn.significanthobbies.com/curriculum/drills/two-sum-hashmap

Given an array of integers and a target, return the indices of the two numbers that add to the target. Solve it in a single pass.

## The mechanism

A hash map trades memory for time: it turns an O(n) scan for "have I seen this?" into an O(1) lookup. Most array problems that feel quadratic collapse to linear once you ask what you would store in a map keyed by value, complement, or frequency.

## Expected evidence

twoSum([2,7,11,15], 9) -> [0,1]

## Hints

- For each number, what value would complete the pair?
- Store value -> index as you scan; check for the complement before inserting.

## Sources and practice

- [Hash table (Wikipedia)](https://en.wikipedia.org/wiki/Hash_table)
- [Study Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/two-sum-hashmap)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
