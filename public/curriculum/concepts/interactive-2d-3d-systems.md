# 2D/3D Interactive Systems

Scene graphs, render loops, input, animation, physics, GPU pipelines, asset loading, and performance budgets.

- Difficulty: core
- Tracks: Application Engineering

## Mental model

Interactive systems turn state into frames under a deadline. Separate simulation and rendering, budget CPU/GPU work, stream assets, and measure frame-time variance.



## Primary sources

- [WebGPU specification (W3C)](https://www.w3.org/TR/webgpu/) (doc)
- [Gaffer On Games (Glenn Fiedler) — Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/) (article)
- [Game Programming Patterns (Nystrom) — chapter: Game Loop](https://gameprogrammingpatterns.com/game-loop.html) (doc)
- [WebGPU Fundamentals — Scene Graphs](https://webgpufundamentals.org/webgpu/lessons/webgpu-scene-graphs.html) (doc)
- [LearnOpenGL — Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems) (doc)

## Practice

### Design exercise: 2D/3D Interactive Systems

Scene graphs, render loops, input, animation, physics, GPU pipelines, asset loading, and performance budgets. Implement designOutline() returning non-empty values for: sceneState, renderLoop, frameBudget. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with sceneState, renderLoop, frameBudget plus an explicit failure mode or trade-off.

## Review prompts

- Why is simulation usually stepped at a fixed timestep while rendering runs as fast as it can?

## Build evidence

- **Synthesize: Application Engineering** — Turn backend, client, UX, real-time, interactive, analytics, and distribution skills into one complete product. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design)

## Related concepts

- [Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design)
- [Product Analytics](https://learn.significanthobbies.com/curriculum/concepts/product-analytics)

## Learning paths

- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w)
