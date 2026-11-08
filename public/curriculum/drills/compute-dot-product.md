# Compute a dot product and angle

> Given u = [3, 4] and v = [1, 2], compute u·v, ||u||, ||v||, and cos θ between them. State whether the vectors are orthogonal.

Canonical: https://learn.significanthobbies.com/curriculum/drills/compute-dot-product

Given u = [3, 4] and v = [1, 2], compute u·v, ||u||, ||v||, and cos θ between them. State whether the vectors are orthogonal.

## The mechanism

A vector is a point and an arrow. The dot product measures alignment (how much one vector projects onto another); orthogonality means zero projection. Most ML objects — embeddings, weights, activations — are vectors living in some space.

## Expected evidence

u·v = 11, ||u|| = 5, ||v|| = √5, cos θ = 11/(5√5) ≈ 0.98, not orthogonal.

## Hints

- Dot product is sum of element-wise products.
- Orthogonal ⟺ dot product is zero.

## Sources and practice

- [Essence of Linear Algebra (3Blue1Brown)](https://www.3blue1brown.com/topics/linear-algebra)
- [3Blue1Brown — Vectors, what even are they?](https://www.3blue1brown.com/lessons/vectors)
- [3Blue1Brown — Dot products and duality](https://www.3blue1brown.com/lessons/dot-products)
- [MIT 18.06 L9 — Independence, basis, and dimension (Strang)](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-9-independence-basis-and-dimension/)
- [Study Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/compute-dot-product)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
