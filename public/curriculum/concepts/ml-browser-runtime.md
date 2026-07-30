# Browser ML Runtime

Web Workers, WASM, OPFS, TypedArrays.

- Difficulty: advanced
- Tracks: Inference & Serving, AI Systems

## Mental model

You can run ML in the browser using libraries like ONNX Runtime Web, TensorFlow.js, or Transformers.js. You trade server cost and user privacy for a slower first load and a limit on model size. WebGPU is fastest, WASM works everywhere, CPU is the fallback. Scope: this card owns the browser as a platform — Workers, WASM, OPFS, model loading and the first-load budget. The GPU backend specifically is `ml-webgpu`; native and mobile execution is `local-on-device-inference`.



## Primary sources

- [Transformers.js (Hugging Face)](https://huggingface.co/docs/transformers.js/index) (doc)

## Practice

### WASM linear memory growth

Page limit ~2–4GB WASM memory. Model weights 1.5B params float16 ≈ 3GB. Can you load weights + activations in one page tab without sharding?

**Expected evidence:** No headroom — need quantization, offloading, or worker sharding.

## Review prompts

- Why does the main thread have to be kept out of browser inference, and what does that force into the design?

## Build evidence

- **Synthesize: Inference & Serving** — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing.html)

## Related concepts

- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu.html)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
