# WASM linear memory growth

> Page limit ~2–4GB WASM memory. Model weights 1.5B params float16 ≈ 3GB. Can you load weights + activations in one page tab without sharding?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-wasm-linear-memory

Page limit ~2–4GB WASM memory. Model weights 1.5B params float16 ≈ 3GB. Can you load weights + activations in one page tab without sharding?

## The mechanism

You can run ML in the browser using libraries like ONNX Runtime Web, TensorFlow.js, or Transformers.js. You trade server cost and user privacy for a slower first load and a limit on model size. WebGPU is fastest, WASM works everywhere, CPU is the fallback. Scope: this card owns the browser as a platform — Workers, WASM, OPFS, model loading and the first-load budget. The GPU backend specifically is `ml-webgpu`; native and mobile execution is `local-on-device-inference`.

## Expected evidence

No headroom — need quantization, offloading, or worker sharding.

## Hints

- 2 bytes/param for fp16.
- Activations and KV cache add on top.

## Sources and practice

- [Transformers.js (Hugging Face)](https://huggingface.co/docs/transformers.js/index)
- [Study Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-wasm-linear-memory)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
