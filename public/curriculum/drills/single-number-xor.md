# Find the single number (XOR)

> Every element appears twice except one. Find it in O(n) time, O(1) space.

Canonical: https://learn.significanthobbies.com/curriculum/drills/single-number-xor

Every element appears twice except one. Find it in O(n) time, O(1) space.

## The mechanism

Bits give you three superpowers: a bitmask is an O(1) set, XOR cancels duplicates, and checking power-of-2 is a single AND. Two tricks worth memorizing: n & (n-1) clears the lowest set bit, and XOR-ing equal values gives zero.

## Expected evidence

xor all → 2 for [4,1,2,1,4].

## Hints

- a^a=0, a^0=a.
- XOR is commutative — order does not matter.

## Sources and practice

- [Bitwise operation (Wikipedia)](https://en.wikipedia.org/wiki/Bitwise_operation)
- [Study Bit Manipulation](https://learn.significanthobbies.com/curriculum/concepts/bit-manipulation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/single-number-xor)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
