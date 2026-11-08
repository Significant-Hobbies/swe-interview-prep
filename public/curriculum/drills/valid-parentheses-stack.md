# Valid parentheses with a stack

> Implement isValid(s) for brackets ()[]{} using a stack.

Canonical: https://learn.significanthobbies.com/curriculum/drills/valid-parentheses-stack

Implement isValid(s) for brackets ()[]{} using a stack.

## The mechanism

A stack is last-in-first-out: the last thing you pushed is the first thing you pop. Reach for one when the natural question is "what was the most recent unfinished thing?" — parsing, recursion, undo, matching brackets.

## Expected evidence

isValid("()[]{}") true; isValid("(]") false.

## Hints

- Push opens; pop must match close.
- Stack empty at end.

## Sources and practice

- [Stack (Wikipedia)](https://en.wikipedia.org/wiki/Stack_(abstract_data_type))
- [Study Stack](https://learn.significanthobbies.com/curriculum/concepts/stack)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/valid-parentheses-stack)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
