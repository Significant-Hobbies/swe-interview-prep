# Local & On-device Inference

llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory.

- Difficulty: core
- Tracks: Inference & Serving

## Mental model

On-device inference trades cloud elasticity for privacy, offline latency, and strict memory/energy budgets. Model format, quantization, kernels, and thermal limits become product constraints. Scope: this card owns running outside the browser — llama.cpp, mobile accelerators, model formats, quantisation, and thermal and memory budgets. In-browser execution is `ml-browser-runtime`, and its GPU path is `ml-webgpu`.



## Primary sources

- [WebLLM: A High-Performance In-Browser LLM Inference Engine](https://arxiv.org/abs/2412.15803) (doc)
- [USENIX ATC '25 — CLONE: Customizing LLMs for Efficient Latency-Aware Inference at the Edge](https://www.youtube.com/watch?v=CNQfMAQOpVs) (doc)
- [Deploy Machine Learning and AI Models On-device with Core ML (WWDC24)](https://developer.apple.com/videos/play/wwdc2024/10161/) (video)
- [LLM in a flash: Efficient Large Language Model Inference with Limited Memory](https://arxiv.org/abs/2312.11514) (paper)
- [llama.cpp](https://github.com/ggml-org/llama.cpp) (doc)

## Practice

### Design exercise: Local & On-device Inference

llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory. Implement designOutline() returning non-empty values for: modelFormat, memoryBudget, deviceFallback. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with modelFormat, memoryBudget, deviceFallback plus an explicit failure mode or trade-off.

## Review prompts

- A model fits in device RAM and still runs badly on a phone. What is the constraint you overlooked?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Multimodal & Spatial Computing** — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html)

## Related concepts

- [Image & Video Generation](https://learn.significanthobbies.com/curriculum/concepts/image-video-generation.html)
- [Robotics Systems](https://learn.significanthobbies.com/curriculum/concepts/robotics-systems.html)

## Learning paths

- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
