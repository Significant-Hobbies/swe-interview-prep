# Learning Path — Browser TinyGPT (from scratch + LoRA)

A self-paced 12-week curriculum for building a browser-capable TinyGPT system:
train a tiny GPT from scratch, then adapt a small base model with LoRA — first in
Python, then ported to WASM and WebGPU.

- **Build repo:** `../../tinygpt/` (sibling fleet project — scaffold + full guide in `tinygpt/docs/`)
- **Mastery tracking:** the 19 `ml-*` concepts below live in `src/data/concepts.json`
  and show up as the **ML** category on the Concepts page, with FSRS decay and review.

The two browser targets:

| Mode               | Purpose                              | Model                                  |
| ------------------ | ------------------------------------ | -------------------------------------- |
| Train from scratch | Learn how GPT training works         | 0.5M–3M param byte-level TinyGPT       |
| LoRA fine-tune     | Learn personalization/style adapting | 5M–15M frozen base + tiny LoRA adapter |

**Golden rule:** build a correct Python reference first, then port to WASM, then
accelerate with WebGPU. Never start in the browser.

---

## How to use this with the app

Each phase below lists the `ml-*` concept ids it covers. After you finish a phase:

1. Open the **Concepts** page → **ML** filter.
2. Open each concept you worked on and self-rate (`again` / `hard` / `good` / `easy`).
3. FSRS schedules the review; the Weakness Planner will resurface rotting concepts.

The concept prereq graph mirrors the build order — you cannot meaningfully review
`ml-self-attention` before `ml-embeddings`.

---

## Phases → concepts

| Phase | Theme                          | Concept ids |
| ----- | ------------------------------ | ----------- |
| 1     | Core ML foundations            | `ml-math`, `ml-gradient-descent`, `ml-backprop`, `ml-softmax-xent`, `ml-adamw` |
| 2     | Language modeling basics       | `ml-tokenization`, `ml-language-modeling`, `ml-sampling` |
| 3     | Transformer / GPT internals    | `ml-embeddings`, `ml-self-attention`, `ml-multi-head`, `ml-transformer-block` |
| 4     | Training & debugging           | `ml-training`, `ml-checkpointing` |
| 5     | LoRA & PEFT                    | `ml-lora` |
| 6     | Data engineering for style     | `ml-data-engineering` |
| 7     | Browser systems                | `ml-browser-runtime` |
| 8     | WebGPU acceleration            | `ml-webgpu` |
| 9     | Evaluation & safety            | `ml-evaluation` |

---

## 12-week roadmap

### Weeks 1–2 — ML & language modeling basics
Build: byte tokenizer, cross entropy, softmax, a bigram language model, sampling.
**Milestone:** generate text from a tiny language model.
Covers: `ml-math`, `ml-gradient-descent`, `ml-backprop`, `ml-softmax-xent`,
`ml-adamw`, `ml-tokenization`, `ml-language-modeling`, `ml-sampling`.

### Weeks 3–4 — TinyGPT in Python
Build: GPT block, attention, MLP, training loop, checkpointing, sampling.
**Milestone:** a 0.8M-param TinyGPT overfits 10 KB of text.
Covers: `ml-embeddings`, `ml-self-attention`, `ml-multi-head`, `ml-transformer-block`.

### Weeks 5–6 — Better training harness
Add: validation loss, loss chart, fixed eval prompts, gradient clipping,
checkpoint reload, dataset manifest + hash.
**Milestone:** a reliable training harness with reproducible (seeded) runs.
Covers: `ml-training`, `ml-checkpointing`.

### Weeks 7–8 — LoRA
Build: a `LoRALinear` layer, adapter injection into `q_proj`/`v_proj`, frozen base,
adapter-only checkpoint, base-vs-LoRA comparison.
**Milestone:** a tiny base model adapts to a small writing corpus.
Covers: `ml-lora`, `ml-data-engineering`.

### Weeks 9–10 — Browser / WASM
Build: Web Worker training shell, WASM backend, WASM-SIMD build, OPFS checkpointing,
browser capability panel.
**Milestone:** a tiny model trains in the browser without freezing the UI.
Covers: `ml-browser-runtime`.

### Weeks 11–12 — WebGPU prototype
Build: WebGPU matmul, CPU/WebGPU parity tests, linear-forward acceleration.
**Milestone:** one WebGPU kernel is correct and measurably faster than WASM.
Covers: `ml-webgpu`, `ml-evaluation`.

---

## Phase exit criteria

Do not advance until the current phase's check passes.

| Phase | You can advance when... |
| ----- | ----------------------- |
| 1 | You can explain forward pass, loss, backward pass, and optimizer step without handwaving. |
| 2 | A bigram model trains and generates text; you can measure train/val loss. |
| 3 | One transformer block, then a full TinyGPT, produce expected shapes at every layer. |
| 4 | The model overfits a 1–10 KB repeated dataset; loss starts near `ln(256) ≈ 5.54`. |
| 5 | A frozen base + LoRA adapter trains, saves, reloads; outputs differ from base. |
| 6 | You have a clean JSONL dataset of 300–1,000 structured examples. |
| 7 | Training runs in a Worker; the UI stays responsive; a checkpoint survives reload. |
| 8 | A WebGPU matmul matches the WASM matmul within tolerance. |
| 9 | You can compare base vs few-shot vs LoRA vs LoRA+retrieval on held-out prompts. |

---

## Traps to avoid

1. **Starting in the browser.** Order is Python → WASM → WebGPU.
2. **Too large a model.** First targets: 0.8M from scratch; 5M–15M frozen base for LoRA.
3. **Confusing style with intelligence.** LoRA learns tone/format, not truth or reasoning.
4. **Not testing memorization.** Tiny models copy training text — always test prefix → continuation.
5. **Skipping baselines.** If LoRA does not beat few-shot prompting, the adapter was not worth training.

The single most important checkpoint: **can it overfit a tiny repeated dataset?**
If not, scaling is pointless — the model, backprop, or data pipeline is broken.

---

*Full implementation guide, model/LoRA specs, and browser notes: `../../tinygpt/docs/`.*
