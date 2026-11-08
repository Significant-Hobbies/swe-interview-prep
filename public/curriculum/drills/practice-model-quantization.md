# Design exercise: Model Quantization

> Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs. Implement designOutline() returning non-empty values for: numericFormat, calibration, qualityGate. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-model-quantization

Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs. Implement designOutline() returning non-empty values for: numericFormat, calibration, qualityGate. Each value must name a concrete mechanism or decision.

## The mechanism

Quantization stores and computes approximate weights or activations with fewer bits. The serving win is real only when hardware kernels support the format and evals bound quality loss.

## Expected evidence

A design outline with numericFormat, calibration, qualityGate plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration](https://arxiv.org/abs/2306.00978)
- [LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale](https://arxiv.org/abs/2208.07339)
- [SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models](https://arxiv.org/abs/2211.10438)
- [Democratizing Foundation Models via k-bit Quantization — Tim Dettmers (Stanford MLSys #82)](https://www.youtube.com/watch?v=EsMcVkTXZrk)
- [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323)
- [Hugging Face Transformers — Quantization](https://huggingface.co/docs/transformers/main/en/quantization/overview)
- [Study Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-model-quantization)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
