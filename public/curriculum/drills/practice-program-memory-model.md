# Trace a program into process memory

> Implement memoryMap() for this C-shaped program: static int requests; int main() { char *buffer = malloc(4096); int count = 0; serve(buffer, &count); free(buffer); }. Return executable, stack, heap, pointer, and process strings. Each must be a distinct explanation of at least six words that names its storage, lifetime, ownership, or loading mechanism.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-program-memory-model

Implement memoryMap() for this C-shaped program: static int requests; int main() { char *buffer = malloc(4096); int count = 0; serve(buffer, &count); free(buffer); }. Return executable, stack, heap, pointer, and process strings. Each must be a distinct explanation of at least six words that names its storage, lifetime, ownership, or loading mechanism.

## The mechanism

A pointer is a typed interpretation of an address inside a process virtual address space. Stack frames follow call lifetimes, heap allocations follow explicit or runtime-managed ownership, and the loader maps code and data into a process before execution begins.

## Expected evidence

A five-part causal trace distinguishing the executable image, stack frame, heap allocation, pointer value, and running process virtual address space.

## Hints

- Separate the pointer variable from the allocation it references.
- Describe what the loader and operating system create before main runs.

## Sources and practice

- [The Rust Programming Language — What Is Ownership?](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)
- [Study Program Memory Model](https://learn.significanthobbies.com/curriculum/concepts/program-memory-model)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-program-memory-model)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
