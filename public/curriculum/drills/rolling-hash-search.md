# Rabin-Karp substring search

> Implement findAll(text, pattern) returning every start index where pattern occurs, using a rolling hash. You MUST verify a character-by-character match on every hash hit — a hash collision is not a match.

Canonical: https://learn.significanthobbies.com/curriculum/drills/rolling-hash-search

Implement findAll(text, pattern) returning every start index where pattern occurs, using a rolling hash. You MUST verify a character-by-character match on every hash hit — a hash collision is not a match.

## The mechanism

Naive matching restarts the pattern after every mismatch, throwing away what the prefix already proved. KMP precomputes how far it can safely jump using the longest proper prefix that is also a suffix, so the text pointer never moves backwards. Rabin-Karp takes the other route: hash a window, roll the hash in O(1) as it slides, and only compare characters when hashes agree — which makes it the natural choice for multi-pattern search and the reason collisions must still be checked.

## Expected evidence

findAll('abababa','aba') -> [0,2,4]

## Hints

- Roll the hash by removing the leading character's contribution and appending the new one; do not rehash the window.
- On a hash hit, compare the substring. Skipping that check is the bug this drill is about.

## Sources and practice


- [Study String Matching](https://learn.significanthobbies.com/curriculum/concepts/string-matching)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/rolling-hash-search)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
