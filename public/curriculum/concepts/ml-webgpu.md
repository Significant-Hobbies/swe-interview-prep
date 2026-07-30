# WebGPU Compute

WGSL, compute kernels, matmul, CPU parity.

- Difficulty: advanced
- Tracks: Inference & Serving, AI Systems

## Mental model

WebGPU lets JavaScript run compute shaders on the GPU, which can speed up matrix math 10-100x in the browser. The real bottlenecks are moving data to and from the GPU and compiling the shaders — not the math itself. Scope: this card owns one backend — compute shaders, WGSL, and the transfer and compilation costs that dominate matmul in practice. The surrounding browser runtime is `ml-browser-runtime`; running outside the browser is `local-on-device-inference`.



## Primary sources

- [Stanford CS336 — L5 GPUs & memory hierarchy (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/main/nonexecutable/2025%20Lecture%205%20-%20GPUs.pdf) (paper)
- [WebGPU API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) (doc)

## Practice

### WebGPU buffer upload size

Tensor 1024×1024 float32. Byte size? If maxStorageBufferBindingSize is 128MB, does one buffer hold the tensor?

**Expected evidence:** 4MB — fits easily; watch alignment and copy queue staging.

## Review prompts

- Your WebGPU matmul is far slower than expected. What are the two usual causes, and neither is the arithmetic?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Multimodal & Spatial Computing** — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime.html)
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block.html)

## Related concepts

- None assigned.

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
