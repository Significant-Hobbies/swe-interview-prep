# Open-Weight Models

Model cards, licenses, weights, tokenizers, chat templates, adapters, provenance, and reproducible packaging.

- Difficulty: core
- Tracks: AI Systems

## Mental model

Open weights provide inspectable parameters, not automatically open data or unrestricted rights. Selection must include license, provenance, tokenizer, template, eval, and hardware fit.



## Primary sources

- [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783) (doc)
- [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) (doc)
- [Rethinking open source generative AI: open-washing and the EU AI Act (FAccT '24)](https://facctconference.org/static/papers24/facct24-120.pdf) (doc)
- [OLMo: Accelerating the Science of Language Models](https://arxiv.org/abs/2402.00838) (paper)
- [Hugging Face Model Cards](https://huggingface.co/docs/hub/model-cards) (doc)

## Practice

### Design exercise: Open-Weight Models

Model cards, licenses, weights, tokenizers, chat templates, adapters, provenance, and reproducible packaging. Implement designOutline() returning non-empty values for: license, provenance, runtimeFit. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with license, provenance, runtimeFit plus an explicit failure mode or trade-off.

## Review prompts

- "Open weights" is not "open source". Name what you still do not get, and the one packaging detail that breaks deployments quietly.

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html)

## Related concepts

- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html)
- [Multimodal Models](https://learn.significanthobbies.com/curriculum/concepts/multimodal-models.html)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
