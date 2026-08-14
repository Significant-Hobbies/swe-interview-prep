# Trie

Prefix trees.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

A trie stores strings in a tree where each path from the root spells out a prefix. It makes prefix queries (autocomplete, IP routing) take time proportional to the length of the prefix, not the size of the dataset.



## Primary sources

- [Trie (Wikipedia)](https://en.wikipedia.org/wiki/Trie) (doc)

## Practice

### Trie prefix membership

Insert ["app","apt","bat"]. Implement startsWith("ap") and search("apt").

**Expected evidence:** startsWith true; search true; search("ba") true prefix but search("ban") false.

## Review prompts

- Why does trie prefix lookup cost the same whether you stored a thousand words or a million?


## Prerequisites

- [Trees](https://learn.significanthobbies.com/curriculum/concepts/trees)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
