# Design exercise: Local & On-device Inference

> llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory. Implement designOutline() returning non-empty values for: modelFormat, memoryBudget, deviceFallback. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-local-on-device-inference

llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory. Implement designOutline() returning non-empty values for: modelFormat, memoryBudget, deviceFallback. Each value must name a concrete mechanism or decision.

## The mechanism

On-device inference trades cloud elasticity for privacy, offline latency, and strict memory/energy budgets. Model format, quantization, kernels, and thermal limits become product constraints. Scope: this card owns running outside the browser — llama.cpp, mobile accelerators, model formats, quantisation, and thermal and memory budgets. In-browser execution is `ml-browser-runtime`, and its GPU path is `ml-webgpu`.

## Expected evidence

A design outline with modelFormat, memoryBudget, deviceFallback plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [WebLLM: A High-Performance In-Browser LLM Inference Engine](https://arxiv.org/abs/2412.15803)
- [USENIX ATC '25 — CLONE: Customizing LLMs for Efficient Latency-Aware Inference at the Edge](https://www.youtube.com/watch?v=CNQfMAQOpVs)
- [Deploy Machine Learning and AI Models On-device with Core ML (WWDC24)](https://developer.apple.com/videos/play/wwdc2024/10161/)
- [LLM in a flash: Efficient Large Language Model Inference with Limited Memory](https://arxiv.org/abs/2312.11514)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Study Local & On-device Inference](https://learn.significanthobbies.com/curriculum/concepts/local-on-device-inference)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-local-on-device-inference)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
