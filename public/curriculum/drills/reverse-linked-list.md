# Reverse a linked list in place

> Reverse singly linked list 1→2→3→null iteratively. Return new head.

Canonical: https://learn.significanthobbies.com/curriculum/drills/reverse-linked-list

Reverse singly linked list 1→2→3→null iteratively. Return new head.

## The mechanism

A linked list trades fast random access for fast inserts and deletes wherever you already have a pointer. The classic moves: a dummy head to simplify edge cases, two pointers (fast and slow), and reversing in place.

## Expected evidence

3→2→1→null.

## Hints

- Keep prev, curr, next pointers.
- Dummy head simplifies inserts elsewhere.

## Sources and practice

- [VisuAlgo — Linked List](https://visualgo.net/en/list)
- [Study Linked List](https://learn.significanthobbies.com/curriculum/concepts/linked-list)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/reverse-linked-list)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
