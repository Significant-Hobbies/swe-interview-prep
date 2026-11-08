# Next greater element

> Implement nextGreater(nums) returning an array where result[i] is the next element to the right strictly greater than nums[i], or -1 if none. Must be O(n) — each index pushed and popped at most once.

Canonical: https://learn.significanthobbies.com/curriculum/drills/next-greater-element

Implement nextGreater(nums) returning an array where result[i] is the next element to the right strictly greater than nums[i], or -1 if none. Must be O(n) — each index pushed and popped at most once.

## The mechanism

Keep the stack monotonic and every element enters and leaves exactly once, so a shape that looks like a nested loop is linear. The moment you pop is the moment you have learned something: the element being popped has just found its next greater (or smaller) neighbour, which is why the answer is written on pop rather than on push.

## Expected evidence

nextGreater([2,1,2,4,3]) -> [4,2,4,-1,-1]

## Hints

- Keep a stack of INDICES whose answer is still unknown, with decreasing values.
- When the current element is greater than the value at the stack top, you have just found that index's answer — pop and record.

## Sources and practice


- [Study Monotonic Stack](https://learn.significanthobbies.com/curriculum/concepts/monotonic-stack)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/next-greater-element)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
