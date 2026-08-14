# Vectors & Vector Spaces

Vectors as ordered lists, dot products, norms, orthogonality, and the geometric picture of n-dimensional space.

- Difficulty: intro
- Tracks: Mathematics

## Mental model

A vector is a point and an arrow. The dot product measures alignment (how much one vector projects onto another); orthogonality means zero projection. Most ML objects — embeddings, weights, activations — are vectors living in some space.

## Where it matters

Embedding similarity, cosine distance, attention scores, gradient directions.

## Common mistakes

- Confusing dot product with element-wise multiplication
- Treating vectors as scalars when adding dimensions
- Forgetting that dot product is zero for perpendicular vectors

## Primary sources

- [Essence of Linear Algebra (3Blue1Brown)](https://www.3blue1brown.com/topics/linear-algebra) (video)
- [3Blue1Brown — Vectors, what even are they?](https://www.3blue1brown.com/lessons/vectors) (video)
- [3Blue1Brown — Dot products and duality](https://www.3blue1brown.com/lessons/dot-products) (video)
- [MIT 18.06 L9 — Independence, basis, and dimension (Strang)](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-9-independence-basis-and-dimension/) (video)

## Practice

### Compute a dot product and angle

Given u = [3, 4] and v = [1, 2], compute u·v, ||u||, ||v||, and cos θ between them. State whether the vectors are orthogonal.

**Expected evidence:** u·v = 11, ||u|| = 5, ||v|| = √5, cos θ = 11/(5√5) ≈ 0.98, not orthogonal.

## Review prompts

- What does the dot product measure geometrically?

## Build evidence

- **Visualize linear projections** — Draw vector projection onto a line/subspace: show orthogonal residual. Connect to OLS geometry.

## Prerequisites

- None assigned.

## Related concepts

- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations)
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math)
- [Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients)

## Learning paths

- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d)
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
