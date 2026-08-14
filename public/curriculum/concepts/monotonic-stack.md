# Monotonic Stack

A stack kept sorted so each element is pushed and popped once, answering next-greater questions in O(n).

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Keep the stack monotonic and every element enters and leaves exactly once, so a shape that looks like a nested loop is linear. The moment you pop is the moment you have learned something: the element being popped has just found its next greater (or smaller) neighbour, which is why the answer is written on pop rather than on push.

## Where it matters

Stock spans, largest rectangle in a histogram, and daily-temperature style problems.

## Common mistakes

- Storing values when you need indices — most answers require the distance, not the element
- Choosing the wrong strictness, so equal elements are handled inconsistently at the boundary
- Forgetting the leftovers: whatever is still on the stack at the end has no next greater element
- Assuming O(n^2) because of the inner while loop, when the amortised bound is linear

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Next greater element

Implement nextGreater(nums) returning an array where result[i] is the next element to the right strictly greater than nums[i], or -1 if none. Must be O(n) — each index pushed and popped at most once.

**Expected evidence:** nextGreater([2,1,2,4,3]) -> [4,2,4,-1,-1]

## Review prompts

- A monotonic stack has a while loop nested inside a for loop, yet it runs in O(n). What is the counting argument, and at which moment is an element's answer known?


## Prerequisites

- [Stack](https://learn.significanthobbies.com/curriculum/concepts/stack)

## Related concepts

- [Sliding Window](https://learn.significanthobbies.com/curriculum/concepts/sliding-window)
- [Intervals](https://learn.significanthobbies.com/curriculum/concepts/intervals)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
