# Queueing Theory

Little's law and the utilisation curve — why latency explodes before a system runs out of capacity.

- Difficulty: core
- Tracks: Mathematics

## Mental model

Little's law (L = λW) is an accounting identity, not a model: it holds for any stable system regardless of arrival or service distribution, which is why it works on a queue, a thread pool, or a whole company's hiring pipeline. The result that actually changes designs is the utilisation curve — waiting time scales as 1/(1−ρ), so a server at 50% has a small queue and one at 95% has twenty times that. Systems do not fall over when utilisation hits 100%; they fall over well before, because latency goes vertical as ρ approaches 1.

## Where it matters

Thread-pool and connection-pool sizing, autoscaling thresholds, and the reason SRE targets utilisation well below saturation.

## Common mistakes

- Sizing for average utilisation and being surprised by tail latency — the curve is nonlinear, so the mean hides it
- Applying Little's law to an unstable system where the queue grows without bound; it requires λ < µ
- Adding servers to fix latency caused by variance rather than by load
- Reading 70% CPU as '30% headroom' when the queueing delay at 70% is already several times the service time

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Latency against utilisation

For an M/M/1 queue implement mm1(lambdaRate, muRate) returning { rho, avgInSystem, avgWaitSeconds } where rho = λ/µ, L = ρ/(1−ρ), W = 1/(µ−λ). Return null when the queue is unstable (λ >= µ). Round rho to 2 decimals, avgInSystem to 2, avgWaitSeconds to 4.

**Expected evidence:** mm1(50,100) -> { rho:0.5, avgInSystem:1, avgWaitSeconds:0.02 }; mm1(95,100) -> avgInSystem 19

## Review prompts

- A service sits at 70% CPU and someone reports '30% headroom'. Using the utilisation curve, why is that reading wrong?


## Prerequisites

- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html)

## Related concepts

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html)

## Learning paths

- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
