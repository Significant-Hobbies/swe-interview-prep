# WebGPU buffer upload size

> Tensor 1024×1024 float32. Byte size? If maxStorageBufferBindingSize is 128MB, does one buffer hold the tensor?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-webgpu-buffer-alignment

Tensor 1024×1024 float32. Byte size? If maxStorageBufferBindingSize is 128MB, does one buffer hold the tensor?

## The mechanism

WebGPU lets JavaScript run compute shaders on the GPU, which can speed up matrix math 10-100x in the browser. The real bottlenecks are moving data to and from the GPU and compiling the shaders — not the math itself. Scope: this card owns one backend — compute shaders, WGSL, and the transfer and compilation costs that dominate matmul in practice. The surrounding browser runtime is `ml-browser-runtime`; running outside the browser is `local-on-device-inference`.

## Expected evidence

4MB — fits easily; watch alignment and copy queue staging.

## Hints

- 4 bytes per f32.
- Check device limits for large models.

## Sources and practice

- [Stanford CS336 — L5 GPUs & memory hierarchy (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/main/nonexecutable/2025%20Lecture%205%20-%20GPUs.pdf)
- [WebGPU API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [Study WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-webgpu-buffer-alignment)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
