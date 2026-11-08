# GRPO group-relative advantage

> Four completions with rewards [1.0, 0.5, 0.8, 0.3]. Mean μ=0.65, population std σ≈0.269. What is the normalized advantage for the top completion (1.0)?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-grpo-group-advantage

Four completions with rewards [1.0, 0.5, 0.8, 0.3]. Mean μ=0.65, population std σ≈0.269. What is the normalized advantage for the top completion (1.0)?

## The mechanism

Post-training RL treats the LM as a policy: sample completions, score them with a reward model, then nudge token probabilities toward high-reward outputs. GRPO compares completions within a group (relative advantages) and reuses rollouts with importance sampling + clipping so training stays stable off-policy.

## Expected evidence

(1.0 − 0.65) / 0.269 ≈ 1.30 — GRPO upweights this rollout relative to the group.

## Hints

- Advantage = (reward − mean) / std across the group.
- Same prompt, multiple sampled completions — compare relatively, not absolutely.

## Sources and practice

- [Lightweight GRPO & RL intro (Murali)](https://gitlostmurali.com/blog/grpo-intro/)
- [Policy Gradient for LMs — RL101 notes (Hamish Ivison)](https://ivison.id.au/2026/02/09/policy-gradient.html)
- [Stanford CS336 — L15 Alignment: SFT & RLHF (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/61eddac004df975466cff0329b615f2d24230069/nonexecutable/2025%20Lecture%2015%20-%20RLHF%20Alignment.pdf)
- [CS336 Assignment 5 — Alignment & reasoning RL](https://github.com/stanford-cs336/assignment5-alignment)
- [Lilian Weng — Policy Gradient Algorithms](https://lilianweng.github.io/posts/2018-04-08-policy-gradient/)
- [Study RL Alignment (GRPO & Policy Gradient)](https://learn.significanthobbies.com/curriculum/concepts/ml-rl-alignment)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-grpo-group-advantage)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
