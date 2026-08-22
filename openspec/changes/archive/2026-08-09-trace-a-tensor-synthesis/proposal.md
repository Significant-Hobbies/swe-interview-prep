## Why

The curriculum teaches machine foundations, model training, and inference serving, but learners must assemble the causal path between those layers themselves. A short synthesis roadmap inspired by AISystem's systems-first organization can make that path explicit without importing its large, fast-aging content archive.

## What Changes

- Add a focused "Trace a Tensor" roadmap that follows one workload from representation and backpropagation through runtime constraints, kernels, quantization, batching, and serving economics.
- Reuse existing concepts and drills rather than expanding the catalog or duplicating source material.
- Add one evidence-backed capstone that requires a layer map, a runnable or modeled benchmark, a bottleneck diagnosis, and a defended optimization.
- Feature the roadmap in the existing AI-native roadmap discovery surfaces and public curriculum output.
- Add integrity coverage for the roadmap's ordering and capstone contract.

## Capabilities

### New Capabilities

- `tensor-lifecycle-synthesis`: A sequenced, artifact-backed curriculum path that connects model computation to the hardware and serving systems that execute it.

### Modified Capabilities

- `expanded-learning-domains`: The existing cross-domain curriculum shall expose an explicit synthesis path across systems foundations, model training, and inference serving.
- `public-curriculum-discovery`: The public curriculum shall publish and count the new roadmap from the canonical curriculum data.

## Impact

- Canonical curriculum data in `src/data/roadmaps.json`, `src/data/artifacts.json`, and linked concept metadata.
- Roadmap discovery configuration and curriculum integrity tests.
- Generated public curriculum pages, catalog, sitemap, and agent-readable metadata.
- No API, database, authentication, runtime, or production dependency changes.
