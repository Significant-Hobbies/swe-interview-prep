# Tensor Lifecycle Synthesis

## Purpose

Connect model computation, machine execution, and inference serving in one bounded path that learners prove with an inspectable systems artifact.

## Requirements

### Requirement: Tensor lifecycle is sequenced across system layers
The learning OS SHALL provide a selectable roadmap that orders existing concepts from tensor representation and gradient computation through memory and runtime behavior, kernel and hardware optimization, and request-level inference serving.

#### Scenario: Learner follows the lifecycle
- **WHEN** a learner opens the Trace a Tensor roadmap
- **THEN** its milestones present the system layers in causal execution order rather than as an unstructured topic collection

### Requirement: Every milestone remains practice-backed
Each roadmap milestone SHALL link existing executable drills for its concepts and SHALL avoid creating duplicate concept records solely for the synthesis path.

#### Scenario: Learner practices a layer
- **WHEN** a learner reaches any Trace a Tensor milestone
- **THEN** the milestone offers at least one resolvable drill tied to an existing canonical concept

### Requirement: Synthesis ends in measurable evidence
The roadmap SHALL end in a capstone that requires a layer map, a reproducible workload or model, measurements before and after one optimization, a bottleneck diagnosis, and an explanation of a trade-off or remaining risk.

#### Scenario: Learner completes the capstone
- **WHEN** the learner submits evidence for the Trace a Tensor artifact
- **THEN** the evidence demonstrates where time or memory is spent and defends an optimization using measured results
