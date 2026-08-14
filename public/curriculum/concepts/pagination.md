# Pagination

Offset versus cursor pagination, stable ordering, and why deep pages get expensive.

- Difficulty: core
- Tracks: Backend

## Mental model

OFFSET makes the database produce and discard every skipped row, so page 10,000 costs proportionally more than page 1 — and because the underlying rows shift between requests, an insert can make a client see the same item twice or miss one entirely. Cursor (keyset) pagination replaces 'skip N' with 'resume after this key', turning every page into an index seek at constant cost and making the sequence stable under concurrent writes. The price is that you can no longer jump to an arbitrary page number.

## Where it matters

Every list endpoint, and the usual cause of an API that is fine in testing and times out on real data.

## Common mistakes

- OFFSET on a large table, where deep pages degrade linearly
- Paginating without a total ordering — ties on the sort key make results non-deterministic across pages
- Exposing a raw primary key as the cursor, leaking row counts and creation order
- Returning a total count on every page, which often costs more than the page itself

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Cursor pagination that survives inserts

Implement page(rows, cursor, limit) for keyset pagination. Rows are {id, createdAt} sorted by (createdAt, id) ascending. cursor is null for the first page or {createdAt, id} for 'resume strictly after this'. Return { items, nextCursor } where nextCursor is the last item's key, or null when the page is not full.

**Expected evidence:** Two sequential pages return disjoint items even when a row is inserted between the calls.

## Review prompts

- An endpoint using OFFSET is fine on page 1 and times out on page 5,000, and users occasionally report a duplicated row. Explain both symptoms and the single change that fixes them.


## Prerequisites

- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design)

## Related concepts

- [Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index)
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w)
