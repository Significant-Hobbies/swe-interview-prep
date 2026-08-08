# Data Representation

Binary and hexadecimal, two's complement, IEEE-754 floating point, Unicode, byte order, and serialized bytes.

- Difficulty: core
- Tracks: Systems Foundations

## Mental model

Bits have no meaning until a representation gives them one. Width, signedness, byte order, numeric format, and text encoding are part of every data contract; the same bytes can describe different values when either side assumes a different representation.

## Where it matters

Binary protocols, database pages, file formats, model tensors, network packet inspection, serialization compatibility, and numerical debugging.

## Common mistakes

- Treating a hex dump as a value without stating width, signedness, and byte order
- Comparing floating-point results as if every decimal fraction has an exact binary representation
- Confusing Unicode code points with UTF-8 bytes or fixed-width characters

## Primary sources

- [Computer Systems: A Programmer's Perspective — Student Site](https://csapp.cs.cmu.edu/3e/students.html) (doc)

## Practice

### Encode a binary compatibility fixture

Implement encodeRepresentations() without hard-coding the returned fixture. Return lowercase hexadecimal strings for four values: signed16Hex for -42 encoded as a 16-bit two's-complement integer, float32Hex for 0.15625 encoded as IEEE-754 binary32, utf8Hex for the string A€, and littleEndianHex for the 32-bit value 0x12345678 written little-endian.

**Expected evidence:** An object with signed16Hex, float32Hex, utf8Hex, and littleEndianHex derived from the requested representations.

## Review prompts

- A packet contains the bytes d6 ff, and one service reads -42 while another reads 65,494. Explain how both results are possible and what the protocol must specify to make the value unambiguous.

## Build evidence

- **Synthesize: Systems Foundations** — Build a tiny HTTP/1.1 static-file server on raw TCP sockets without a framework or high-level HTTP server library. Parse requests, serve bounded files, handle partial I/O, inject failures, measure the result, and explain how the operating system, network, memory, concurrency, and storage paths interact.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- None assigned.

## Related concepts

- [Program Memory Model](https://learn.significanthobbies.com/curriculum/concepts/program-memory-model.html)
- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html)

## Learning paths

- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor.html)
