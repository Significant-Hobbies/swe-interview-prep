# Size a write-heavy service

> Implement size(dau, writesPerUserPerDay, bytesPerWrite, replicationFactor, peakMultiplier) returning { writesPerSecond, peakWritesPerSecond, storagePerDayGB, storagePerYearTB }. Use 86400 s/day and 365 d/yr. Storage counts replication. Use GB = 1e9 bytes and TB = 1e12 bytes (decimal, as capacity planning does). Round every value to the nearest integer.

Canonical: https://learn.significanthobbies.com/curriculum/drills/size-a-write-heavy-service

Implement size(dau, writesPerUserPerDay, bytesPerWrite, replicationFactor, peakMultiplier) returning { writesPerSecond, peakWritesPerSecond, storagePerDayGB, storagePerYearTB }. Use 86400 s/day and 365 d/yr. Storage counts replication. Use GB = 1e9 bytes and TB = 1e12 bytes (decimal, as capacity planning does). Round every value to the nearest integer.

## The mechanism

Estimation exists to eliminate designs, not to be accurate. One order of magnitude is the whole game: 100 GB/day means one machine, 100 TB/day means a fleet, and that single answer picks your storage engine, your sharding story, and whether replication is affordable. Do it before the boxes-and-arrows, because a design drawn without a number is a design you cannot defend.

## Expected evidence

size(10e6, 20, 500, 3, 5) -> { writesPerSecond: 2315, peakWritesPerSecond: 11574, storagePerDayGB: 300, storagePerYearTB: 110 }

## Hints

- Writes per second is total daily writes divided by 86400 — peak is that multiplied by the peak factor.
- Replication multiplies stored bytes, not the write rate you compute per second before replication.

## Sources and practice

- [Site Reliability Engineering (Google) — chapter 21: Handling Overload](https://sre.google/sre-book/handling-overload/)
- [Study Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/size-a-write-heavy-service)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
