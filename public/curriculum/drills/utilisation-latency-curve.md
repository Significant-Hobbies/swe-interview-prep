# Latency against utilisation

> For an M/M/1 queue implement mm1(lambdaRate, muRate) returning { rho, avgInSystem, avgWaitSeconds } where rho = λ/µ, L = ρ/(1−ρ), W = 1/(µ−λ). Return null when the queue is unstable (λ >= µ). Round rho to 2 decimals, avgInSystem to 2, avgWaitSeconds to 4.

Canonical: https://learn.significanthobbies.com/curriculum/drills/utilisation-latency-curve

For an M/M/1 queue implement mm1(lambdaRate, muRate) returning { rho, avgInSystem, avgWaitSeconds } where rho = λ/µ, L = ρ/(1−ρ), W = 1/(µ−λ). Return null when the queue is unstable (λ >= µ). Round rho to 2 decimals, avgInSystem to 2, avgWaitSeconds to 4.

## The mechanism

Little's law (L = λW) is an accounting identity, not a model: it holds for any stable system regardless of arrival or service distribution, which is why it works on a queue, a thread pool, or a whole company's hiring pipeline. The result that actually changes designs is the utilisation curve — waiting time scales as 1/(1−ρ), so a server at 50% has a small queue and one at 95% has twenty times that. Systems do not fall over when utilisation hits 100%; they fall over well before, because latency goes vertical as ρ approaches 1.

## Expected evidence

mm1(50,100) -> { rho:0.5, avgInSystem:1, avgWaitSeconds:0.02 }; mm1(95,100) -> avgInSystem 19

## Hints

- Stability first: at λ >= µ the queue grows without bound and the formulas are meaningless.
- Note how little λ changes between the two cases and how much L does — that is the 1/(1−ρ) term.

## Sources and practice


- [Study Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/utilisation-latency-curve)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
