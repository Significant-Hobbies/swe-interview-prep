# Cursor pagination that survives inserts

> Implement page(rows, cursor, limit) for keyset pagination. Rows are {id, createdAt} sorted by (createdAt, id) ascending. cursor is null for the first page or {createdAt, id} for 'resume strictly after this'. Return { items, nextCursor } where nextCursor is the last item's key, or null when the page is not full.

Canonical: https://learn.significanthobbies.com/curriculum/drills/keyset-pagination

Implement page(rows, cursor, limit) for keyset pagination. Rows are {id, createdAt} sorted by (createdAt, id) ascending. cursor is null for the first page or {createdAt, id} for 'resume strictly after this'. Return { items, nextCursor } where nextCursor is the last item's key, or null when the page is not full.

## The mechanism

OFFSET makes the database produce and discard every skipped row, so page 10,000 costs proportionally more than page 1 — and because the underlying rows shift between requests, an insert can make a client see the same item twice or miss one entirely. Cursor (keyset) pagination replaces 'skip N' with 'resume after this key', turning every page into an index seek at constant cost and making the sequence stable under concurrent writes. The price is that you can no longer jump to an arbitrary page number.

## Expected evidence

Two sequential pages return disjoint items even when a row is inserted between the calls.

## Hints

- 'Strictly after' on a composite key: createdAt greater, OR createdAt equal and id greater. The tiebreak is what makes it total.
- Comparing on createdAt alone breaks as soon as two rows share a timestamp.

## Sources and practice


- [Study Pagination](https://learn.significanthobbies.com/curriculum/concepts/pagination)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/keyset-pagination)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
