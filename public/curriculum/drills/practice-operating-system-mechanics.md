# Design exercise: Operating System Mechanics

> Processes, threads, virtual memory, scheduling, filesystems, syscalls, and kernel boundaries. Implement designOutline() returning non-empty values for: processModel, memoryModel, ioPath. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-operating-system-mechanics

Processes, threads, virtual memory, scheduling, filesystems, syscalls, and kernel boundaries. Implement designOutline() returning non-empty values for: processModel, memoryModel, ioPath. Each value must name a concrete mechanism or decision.

## The mechanism

An operating system multiplexes hardware while enforcing isolation. Processes, virtual memory, schedulers, and filesystems are policies built on CPU, memory, and device mechanisms.

## Expected evidence

A design outline with processModel, memoryModel, ioPath plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- [Study Operating System Mechanics](https://learn.significanthobbies.com/curriculum/concepts/operating-system-mechanics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-operating-system-mechanics)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
