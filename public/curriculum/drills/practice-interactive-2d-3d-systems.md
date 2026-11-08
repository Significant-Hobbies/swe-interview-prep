# Design exercise: 2D/3D Interactive Systems

> Scene graphs, render loops, input, animation, physics, GPU pipelines, asset loading, and performance budgets. Implement designOutline() returning non-empty values for: sceneState, renderLoop, frameBudget. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-interactive-2d-3d-systems

Scene graphs, render loops, input, animation, physics, GPU pipelines, asset loading, and performance budgets. Implement designOutline() returning non-empty values for: sceneState, renderLoop, frameBudget. Each value must name a concrete mechanism or decision.

## The mechanism

Interactive systems turn state into frames under a deadline. Separate simulation and rendering, budget CPU/GPU work, stream assets, and measure frame-time variance.

## Expected evidence

A design outline with sceneState, renderLoop, frameBudget plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [WebGPU specification (W3C)](https://www.w3.org/TR/webgpu/)
- [Gaffer On Games (Glenn Fiedler) — Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)
- [Game Programming Patterns (Nystrom) — chapter: Game Loop](https://gameprogrammingpatterns.com/game-loop.html)
- [WebGPU Fundamentals — Scene Graphs](https://webgpufundamentals.org/webgpu/lessons/webgpu-scene-graphs.html)
- [LearnOpenGL — Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems)
- [Study 2D/3D Interactive Systems](https://learn.significanthobbies.com/curriculum/concepts/interactive-2d-3d-systems)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-interactive-2d-3d-systems)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
