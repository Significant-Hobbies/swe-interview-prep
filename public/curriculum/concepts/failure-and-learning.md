# Failure & Learning

Owning mistakes, post-mortem.

- Difficulty: intro
- Tracks: Behavioral & Communication, Behavioral & Communication

## Mental model

A real failure cost something you cannot get back. A useful failure story names exactly what you got wrong, what you tried next, and what concretely changed in your behavior since. "I learned a lot" is not a lesson.



## Primary sources

- [STAR interview method (Wikipedia)](https://en.wikipedia.org/wiki/Situation,_task,_action,_result) (doc)
- [Google SRE Book — Ch. 15: Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/) (doc)
- [Etsy — Debriefing Facilitation Guide (Allspaw et al.)](https://extfiles.etsy.com/DebriefingFacilitationGuide.pdf) (doc)
- [How Complex Systems Fail (Richard I. Cook)](https://how.complexsystems.fail/) (article)

## Practice

### STAR: a real failure

Write a STAR about a project that failed. Be specific about what you got wrong. End with what concretely changed in your behavior since.

**Expected evidence:** starStory() returns { situation, task, action, result, metric: { name, unit, before, after }, behaviorChange (what concretely changed since) }. The checker enforces structure only: four distinct sections of 20+ words, action the longest, 150+ words total, before ≠ after, and the result section must name the metric and state its after value. Aim for 250-350 words — that is the interview bar, not the checker’s.

## Review prompts

- What makes a post-mortem blameless in practice rather than just in name?


## Prerequisites

- None assigned.

## Related concepts

- None assigned.

## Learning paths

- [Behavioral Practice](https://learn.significanthobbies.com/curriculum/roadmaps/behavioral-practice)
