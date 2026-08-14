# Program Memory Model

Pointers, stack frames, heap allocation, object lifetime, executable loading, and the transition from a program on disk to a running process.

- Difficulty: core
- Tracks: Systems Foundations

## Mental model

A pointer is a typed interpretation of an address inside a process virtual address space. Stack frames follow call lifetimes, heap allocations follow explicit or runtime-managed ownership, and the loader maps code and data into a process before execution begins.

## Where it matters

Debugging crashes and leaks, understanding allocators and garbage collectors, designing FFI boundaries, reading profiles, and reasoning about process isolation.

## Common mistakes

- Saying a pointer lives on the heap when only the allocation it references is on the heap
- Equating virtual addresses with stable physical memory locations
- Ignoring ownership and lifetime when memory crosses thread, callback, or process boundaries

## Primary sources

- [The Rust Programming Language — What Is Ownership?](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) (doc)

## Practice

### Trace a program into process memory

Implement memoryMap() for this C-shaped program: static int requests; int main() { char *buffer = malloc(4096); int count = 0; serve(buffer, &count); free(buffer); }. Return executable, stack, heap, pointer, and process strings. Each must be a distinct explanation of at least six words that names its storage, lifetime, ownership, or loading mechanism.

**Expected evidence:** A five-part causal trace distinguishing the executable image, stack frame, heap allocation, pointer value, and running process virtual address space.

## Review prompts

- In char *buffer = malloc(4096), where do the pointer and pointed-to bytes live, who controls each lifetime, and what changes when the executable becomes a process?

## Build evidence

- **Synthesize: Systems Foundations** — Build a tiny HTTP/1.1 static-file server on raw TCP sockets without a framework or high-level HTTP server library. Parse requests, serve bounded files, handle partial I/O, inject failures, measure the result, and explain how the operating system, network, memory, concurrency, and storage paths interact.

## Prerequisites

- [Data Representation](https://learn.significanthobbies.com/curriculum/concepts/data-representation)

## Related concepts

- [Data Representation](https://learn.significanthobbies.com/curriculum/concepts/data-representation)
- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy)
- [Operating System Mechanics](https://learn.significanthobbies.com/curriculum/concepts/operating-system-mechanics)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w)
