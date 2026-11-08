# Encode a binary compatibility fixture

> Implement encodeRepresentations() without hard-coding the returned fixture. Return lowercase hexadecimal strings for four values: signed16Hex for -42 encoded as a 16-bit two's-complement integer, float32Hex for 0.15625 encoded as IEEE-754 binary32, utf8Hex for the string A€, and littleEndianHex for the 32-bit value 0x12345678 written little-endian.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-data-representation

Implement encodeRepresentations() without hard-coding the returned fixture. Return lowercase hexadecimal strings for four values: signed16Hex for -42 encoded as a 16-bit two's-complement integer, float32Hex for 0.15625 encoded as IEEE-754 binary32, utf8Hex for the string A€, and littleEndianHex for the 32-bit value 0x12345678 written little-endian.

## The mechanism

Bits have no meaning until a representation gives them one. Width, signedness, byte order, numeric format, and text encoding are part of every data contract; the same bytes can describe different values when either side assumes a different representation.

## Expected evidence

An object with signed16Hex, float32Hex, utf8Hex, and littleEndianHex derived from the requested representations.

## Hints

- Use fixed-width buffers or typed views so width and byte order are explicit.
- A TextEncoder exposes UTF-8 bytes without assuming one byte per character.

## Sources and practice

- [Computer Systems: A Programmer's Perspective — Student Site](https://csapp.cs.cmu.edu/3e/students.html)
- [Study Data Representation](https://learn.significanthobbies.com/curriculum/concepts/data-representation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-data-representation)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
