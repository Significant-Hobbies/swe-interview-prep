# Activity selection greedy

> Activities by end time: [1,4],[3,5],[0,6],[5,7],[8,9],[5,9]. Max non-overlapping count?

Canonical: https://learn.significanthobbies.com/curriculum/drills/activity-selection-greedy

Activities by end time: [1,4],[3,5],[0,6],[5,7],[8,9],[5,9]. Max non-overlapping count?

## The mechanism

A greedy algorithm always picks the choice that looks best right now. It only gives the right answer when the problem has a structure (an exchange argument) that proves local choices add up correctly. When they do not, greedy quietly returns wrong answers.

## Expected evidence

3 activities: [1,4], [5,7], [8,9].

## Hints

- Sort by finish time.
- Take next compatible activity greedily.

## Sources and practice

- [Greedy algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Greedy_algorithm)
- [Study Greedy](https://learn.significanthobbies.com/curriculum/concepts/greedy)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/activity-selection-greedy)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
