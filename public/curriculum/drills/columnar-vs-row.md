# Columnar vs row store

> Analytics query: SELECT avg(price) FROM sales WHERE date>2024. Which store wins and why?

Canonical: https://learn.significanthobbies.com/curriculum/drills/columnar-vs-row

Analytics query: SELECT avg(price) FROM sales WHERE date>2024. Which store wins and why?

## The mechanism

A column store groups data by column instead of by row. Reading one column out of many becomes very fast (great for analytics), but writing or updating a single row gets slower. Pick row-stores for transactions, column-stores for analytics.

## Expected evidence

Columnar — reads only price+date columns, better compression.

## Hints

- Row store reads whole records.
- Columnar skips untouched fields.

## Sources and practice

- [Apache Parquet — File format](https://parquet.apache.org/docs/file-format/)
- [Study Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/columnar-vs-row)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
