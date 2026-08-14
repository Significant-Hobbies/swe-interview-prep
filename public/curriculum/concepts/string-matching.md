# String Matching

Finding a pattern in text in linear time — KMP's failure function and Rabin-Karp's rolling hash.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Naive matching restarts the pattern after every mismatch, throwing away what the prefix already proved. KMP precomputes how far it can safely jump using the longest proper prefix that is also a suffix, so the text pointer never moves backwards. Rabin-Karp takes the other route: hash a window, roll the hash in O(1) as it slides, and only compare characters when hashes agree — which makes it the natural choice for multi-pattern search and the reason collisions must still be checked.

## Where it matters

grep, plagiarism and duplicate detection, and the substring primitives inside every editor.

## Common mistakes

- Treating a Rabin-Karp hash match as a match — you must verify the characters, or an adversarial input degrades to O(nm)
- Building the KMP failure table against the text instead of the pattern
- Using a rolling hash modulo a small constant, making collisions common enough to matter
- Reaching for KMP when a library indexOf is both correct and faster in practice

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Rabin-Karp substring search

Implement findAll(text, pattern) returning every start index where pattern occurs, using a rolling hash. You MUST verify a character-by-character match on every hash hit — a hash collision is not a match.

**Expected evidence:** findAll('abababa','aba') -> [0,2,4]

## Review prompts

- Rabin-Karp finds a window whose hash equals the pattern's hash. Why is it wrong to report a match, and what is the worst case if you skip the check?


## Prerequisites

- [Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis)

## Related concepts

- [Trie](https://learn.significanthobbies.com/curriculum/concepts/tries)
- [Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
