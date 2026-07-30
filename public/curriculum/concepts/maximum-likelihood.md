# Maximum Likelihood Estimation

Choosing parameters that make the observed data most probable; log-likelihood; connection to cross-entropy loss.

- Difficulty: advanced
- Tracks: Mathematics

## Mental model

MLE picks the parameter values that maximize the probability of what you actually saw. Log-likelihood turns products into sums — easier to optimize. Minimizing cross-entropy on classification data is MLE under a Bernoulli/categorical model.

## Where it matters

Training classifiers, fitting regression, EM algorithms, calibration.

## Common mistakes

- Maximizing likelihood on training data with no regularization (overfitting)
- Forgetting that MLE is a point estimate, not uncertainty
- Mixing up likelihood P(data|θ) with probability of θ

## Primary sources

- [StatQuest — Maximum Likelihood](https://www.youtube.com/watch?v=XepXbq9wr90) (video)

## Practice

### MLE for Bernoulli trials

n=100 Bernoulli trials, 55 successes. Write the likelihood L(p)=p^55(1−p)^45, take log, differentiate, and solve for p̂. Why is this the same as the sample proportion?

**Expected evidence:** p̂=55/100=0.55. Log-likelihood derivative gives successes/n — MLE equals the intuitive estimator here.

## Review prompts

- How does MLE relate to cross-entropy loss?
- Likelihood vs posterior?


## Prerequisites

- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html)
- [Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions.html)
- [Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients.html)

## Related concepts

- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html)
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html)
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent.html)
- [Information & Entropy](https://learn.significanthobbies.com/curriculum/concepts/information-entropy.html)

## Learning paths

- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html)
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
