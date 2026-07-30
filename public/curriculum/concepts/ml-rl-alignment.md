# RL Alignment (GRPO & Policy Gradient)

Policy gradient, advantages, GRPO/CISPO, on- vs off-policy RLHF.

- Difficulty: advanced
- Tracks: AI Systems

## Mental model

Post-training RL treats the LM as a policy: sample completions, score them with a reward model, then nudge token probabilities toward high-reward outputs. GRPO compares completions within a group (relative advantages) and reuses rollouts with importance sampling + clipping so training stays stable off-policy.



## Primary sources

- [Lightweight GRPO & RL intro (Murali)](https://gitlostmurali.com/blog/grpo-intro/) (article)
- [Policy Gradient for LMs — RL101 notes (Hamish Ivison)](https://ivison.id.au/2026/02/09/policy-gradient.html) (article)
- [Stanford CS336 — L15 Alignment: SFT & RLHF (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/61eddac004df975466cff0329b615f2d24230069/nonexecutable/2025%20Lecture%2015%20-%20RLHF%20Alignment.pdf) (paper)
- [CS336 Assignment 5 — Alignment & reasoning RL](https://github.com/stanford-cs336/assignment5-alignment) (doc)
- [Lilian Weng — Policy Gradient Algorithms](https://lilianweng.github.io/posts/2018-04-08-policy-gradient/) (article)

## Practice

### GRPO group-relative advantage

Four completions with rewards [1.0, 0.5, 0.8, 0.3]. Mean μ=0.65, population std σ≈0.269. What is the normalized advantage for the top completion (1.0)?

**Expected evidence:** (1.0 − 0.65) / 0.269 ≈ 1.30 — GRPO upweights this rollout relative to the group.

## Review prompts

- In GRPO-style RL alignment, why are advantages computed relative to a group of completions for the same prompt, and why is importance sampling needed?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora.html)
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling.html)

## Related concepts

- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation.html)
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training.html)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
