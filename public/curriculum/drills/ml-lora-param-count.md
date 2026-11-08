# LoRA parameter count

> W is 4096×4096 (frozen). LoRA rank r=8. How many trainable params in A (4096×r) and B (r×4096)?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-lora-param-count

W is 4096×4096 (frozen). LoRA rank r=8. How many trainable params in A (4096×r) and B (r×4096)?

## The mechanism

LoRA fine-tunes a big model cheaply by adding small trainable matrices alongside the frozen weights. You only update around 1% of the parameters yet get most of the quality of full fine-tuning, and you can swap adapters at inference time.

## Expected evidence

4096·8 + 8·4096 = 65,536 trainable vs 16M full matrix.

## Hints

- Train A and B only; W stays fixed.
- Params = d·r + r·d.

## Sources and practice

- [Stanford CS336 — L15 Alignment: SFT & RLHF (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/61eddac004df975466cff0329b615f2d24230069/nonexecutable/2025%20Lecture%2015%20-%20RLHF%20Alignment.pdf)
- [CS336 Assignment 5 — Alignment & reasoning RL](https://github.com/stanford-cs336/assignment5-alignment)
- [LoRA: Low-Rank Adaptation (Hu et al.)](https://arxiv.org/abs/2106.09685)
- [HuggingFace PEFT — LoRA guide](https://huggingface.co/docs/peft/en/conceptual_guides/lora)
- [How to Scale Your Model (JAX ML scaling book)](https://jax-ml.github.io/scaling-book/)
- [Study LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-lora-param-count)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
