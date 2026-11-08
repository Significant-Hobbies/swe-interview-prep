# Dot product and matmul shapes

> Vectors a=[1,2,3], b=[4,5,6]. Compute dot(a,b). Matrices A (2×3) and B (3×2): is A·B valid? What is the output shape?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-dot-matmul-shapes

Vectors a=[1,2,3], b=[4,5,6]. Compute dot(a,b). Matrices A (2×3) and B (3×2): is A·B valid? What is the output shape?

## The mechanism

Three lenses keep coming back: linear algebra describes the data (vectors and matrices), calculus describes learning (gradients), probability describes uncertainty. Pick the lens that matches the question.

## Expected evidence

dot=32; A·B is 2×2.

## Hints

- Dot = sum of elementwise products.
- Inner dimensions must match for matmul.

## Sources and practice

- [Math Notes for ML (Alisa Wuffles)](https://alisawuffles.notion.site/math-notes)
- [Neural Networks: Zero to Hero (Karpathy)](https://karpathy.ai/zero-to-hero.html)
- [Essence of Linear Algebra (3Blue1Brown)](https://www.3blue1brown.com/topics/linear-algebra)
- [CS231n — Linear algebra & calculus prerequisites](https://cs231n.github.io/optimization-1/)
- [Study ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-dot-matmul-shapes)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
