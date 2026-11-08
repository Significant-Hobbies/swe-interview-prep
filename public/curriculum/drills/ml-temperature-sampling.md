# Temperature scaling logits

> Logits [2,1,0]. Apply temperature T=2 and T=0.5 before softmax. Which T makes the distribution sharper?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-temperature-sampling

Logits [2,1,0]. Apply temperature T=2 and T=0.5 before softmax. Which T makes the distribution sharper?

## The mechanism

After the model outputs a probability for each next token, you have to pick one. Greedy picks the top — safe but dull. Temperature, top-k, and top-p (nucleus) introduce controlled randomness. Pick by how much variety the task can tolerate.

## Expected evidence

T<1 sharpens (more greedy); T>1 flattens.

## Hints

- Divide logits by T before softmax.
- T→0 approaches argmax.

## Sources and practice

- [Stanford CS336 — L10 Inference (Spring 2025)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_10.json)
- [The Curious Case of Neural Text Degeneration (Holtzman et al.)](https://arxiv.org/abs/1904.09751)
- [The Illustrated GPT-2 — output sampling](https://jalammar.github.io/illustrated-gpt2/)
- [HuggingFace — Generation strategies](https://huggingface.co/docs/transformers/en/generation_strategies)
- [Study Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-temperature-sampling)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
