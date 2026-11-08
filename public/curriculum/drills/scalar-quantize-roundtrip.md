# Scalar quantise and rescore

> Implement quantize(vec, min, max) mapping each float to an int in 0..255, dequantize(codes, min, max) mapping back to the bucket centre, and maxAbsError(vec, min, max) returning the largest absolute reconstruction error. Values outside [min,max] clamp.

Canonical: https://learn.significanthobbies.com/curriculum/drills/scalar-quantize-roundtrip

Implement quantize(vec, min, max) mapping each float to an int in 0..255, dequantize(codes, min, max) mapping back to the bucket centre, and maxAbsError(vec, min, max) returning the largest absolute reconstruction error. Values outside [min,max] clamp.

## The mechanism

Quantisation trades recall for memory, and memory is what decides whether an index fits in RAM. Scalar quantisation maps each float32 dimension to int8 for a 4x reduction and small recall loss; binary quantisation keeps one bit per dimension for 32x, turning distance into a Hamming popcount that is enormously faster but far coarser. The standard pattern is two-stage: retrieve a generous candidate set with the compressed vectors, then rescore the survivors against full-precision copies, which recovers most of the lost accuracy for a fraction of the memory.

## Expected evidence

Error is bounded by half a bucket width: (max-min)/255/2.

## Hints

- Bucket width is (max-min)/255; the centre of a bucket is the honest reconstruction.
- Clamp before scaling or an outlier will produce a code outside 0..255.

## Sources and practice


- [Study Scalar & Binary Quantization](https://learn.significanthobbies.com/curriculum/concepts/vector-quantization)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/scalar-quantize-roundtrip)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
