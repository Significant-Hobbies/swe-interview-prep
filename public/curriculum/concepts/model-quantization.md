# Model Quantization

Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.

- Difficulty: core
- Tracks: AI Systems

## Mental model

Quantization stores and computes approximate weights or activations with fewer bits. The serving win is real only when hardware kernels support the format and evals bound quality loss.



## Primary sources

- [AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration](https://arxiv.org/abs/2306.00978) (doc)
- [LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale](https://arxiv.org/abs/2208.07339) (doc)
- [SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models](https://arxiv.org/abs/2211.10438) (doc)
- [Democratizing Foundation Models via k-bit Quantization — Tim Dettmers (Stanford MLSys #82)](https://www.youtube.com/watch?v=EsMcVkTXZrk) (video)
- [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323) (paper)
- [Hugging Face Transformers — Quantization](https://huggingface.co/docs/transformers/main/en/quantization/overview) (doc)

## Practice

### Design exercise: Model Quantization

Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs. Implement designOutline() returning non-empty values for: numericFormat, calibration, qualityGate. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with numericFormat, calibration, qualityGate plus an explicit failure mode or trade-off.

## Review prompts

- You quantized to int4 and memory dropped but throughput did not. What went wrong?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Multimodal & Spatial Computing** — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Trace a Tensor: Diagnose and Optimize One Workload** — Trace one tensor-producing model operation from its numerical representation and computation graph through memory movement, kernel execution, engine scheduling, and request-level serving. Build or precisely model a reproducible workload, identify its dominant bottleneck, apply one justified optimization, and defend the resulting quality, latency, resource, and cost trade-offs.

## Prerequisites

- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora)

## Related concepts

- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora)
- [Multimodal Models](https://learn.significanthobbies.com/curriculum/concepts/multimodal-models)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
- [Trace a Tensor](https://learn.significanthobbies.com/curriculum/roadmaps/trace-a-tensor)
