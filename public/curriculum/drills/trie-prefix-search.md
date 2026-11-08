# Trie prefix membership

> Insert ["app","apt","bat"]. Implement startsWith("ap") and search("apt").

Canonical: https://learn.significanthobbies.com/curriculum/drills/trie-prefix-search

Insert ["app","apt","bat"]. Implement startsWith("ap") and search("apt").

## The mechanism

A trie stores strings in a tree where each path from the root spells out a prefix. It makes prefix queries (autocomplete, IP routing) take time proportional to the length of the prefix, not the size of the dataset.

## Expected evidence

startsWith true; search true; search("ba") true prefix but search("ban") false.

## Hints

- Each node maps char → child.
- End-of-word flag for complete keys.

## Sources and practice

- [Trie (Wikipedia)](https://en.wikipedia.org/wiki/Trie)
- [Study Trie](https://learn.significanthobbies.com/curriculum/concepts/tries)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/trie-prefix-search)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
