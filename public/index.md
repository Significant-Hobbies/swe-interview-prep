# Prepare for interviews by building understanding you can demonstrate.

> A personal learning OS that turns software-engineering interview study into retained, artifact-backed understanding.

Canonical: https://learn.significanthobbies.com/

Personal SWE learning OS · Interview prep

Learn a mechanism, practise it in code or a diagram, explain it back in your own words, and let FSRS bring it back right before you would have forgotten it.

[Start learning](https://learn.significanthobbies.com/dashboard) · [Browse the curriculum](https://learn.significanthobbies.com/curriculum/)

Free · no account needed · progress stays in this browser

Search & IR · concept

Tokenization

Explained back. Next review set by FSRS.

Illustrative · one concept moving through the loop

- **Learn:** A mental model, a primary source, and the prerequisites.
- **Practise:** Code or a diagram in a real workspace, run against tests.
- **Explain:** Say it back in your own words. The AI asks; it never answers.
- **Review:** FSRS brings it back right before you would have forgotten it.

## Reading about a mechanism is not the same as being able to explain it.

That gap is the interview.

Every concept here ends in something you made or said: running code, a diagram, a decision, an explanation. Mastery is what you demonstrated, not pages you read.

## Learn. Practise. Explain. Review.

One loop, every concept

DSA, system design, backend, AI systems, and behavioural rounds share one mastery model instead of five separate tools.

### Learn: Start from the mechanism.

259 concepts across 19 tracks, each with a short mental model, a primary source, and the prerequisites it rests on. 26 roadmaps order them, from a 9-day reset to a 12-month run.

Concept

Tokenization

Splitting text into terms: lowercasing, stemming, stop words, n-grams.

- **Mental model:** The same analyzer must run at index time and query time.
- **Primary source:** Introduction to Information Retrieval, §2.2.1
- **Related:** Inverted index · BM25

Illustrative · simplified from the app

### Practise: Make it run, or draw it.

305 drills in a Monaco editor and an Excalidraw canvas. Code runs against tests; system designs become diagrams you can defend.

Build a search tokenizer

Lowercase, split on non-alphanumerics, drop stop words, stem. Same function at index and query time.

```javascript
function tokenize(s) {
  return s.toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter(t => !STOPS.has(t))
    .map(stem);
}
```

tokenize('The Quick Brown Foxes!') → ["quick","brown","fox"]

Illustrative · simplified from the app

### Explain: Say it back, without the key.

The Socratic companion only asks questions; it never hands over a solution. A Feynman explain-back gates the concept: one example, one failure mode, in your own words.

Socratic companion

If a document says “Foxes” and the query says “fox”, where in your pipeline do they become the same term?

Your explain-back

Both go through the same analyzer, so “foxes” stems to “fox” on both sides. The failure mode: stem too hard and “university” collides with “universe”.

One example · one failure mode

Illustrative · simplified from the app

### Review: Retrieve it before it fades.

FSRS schedules the next retrieval from what you actually demonstrated, so strong concepts wait longer and shaky ones come back soon. 278 review questions keep it honest.

- Tokenization: Due today
- Inverted index: In 3 days
- BM25 scoring: In 9 days

Without looking: why must the tokenizer be identical at index and query time?

Again · Hard · Good · Easy

Illustrative · simplified from the app

## What it covers

19 tracks. One mastery model.

From arrays and graphs to inference serving and agent systems, plus the interview round that is not about code.

- Search & IR
- Mathematics
- Vector DB & ANN
- AI Systems
- Backend
- Databases & Storage
- System Design
- DSA & Implementation
- Behavioral & Communication
- Go-to-Market
- Systems Foundations
- Infrastructure & Platforms
- Distributed Systems
- Inference & Serving
- Agent Systems
- Evaluation & AI Reliability
- Developer Tools & Code Intelligence
- Application Engineering
- Multimodal & Spatial Computing

## An honest fit

Interview prep that takes understanding seriously.

### A fit

Engineers who want to explain why a B-tree, a rate limiter, or a KV cache behaves the way it does, and still remember it in three weeks.

### Not a fit

An answer bank to memorise the night before. Nothing here hands you a solution, and progress is earned, not clicked.

## A few honest answers.

### Do I need an account?

No. Every route works as a guest, and guest progress stays in this browser. Google sign-in only adds progress that follows you across devices.

### Does it cost anything?

No. There is no paid tier, subscription, or checkout.

### Will the AI just give me the answer?

No, by design. The companion probes your understanding with questions. Working it out is the point.

### Is it actively developed?

It is a mature personal learning system, built for its author’s own preparation and now in maintenance-only mode. It is kept working, not chasing features.

## Start with one concept

Pick one mechanism. Prove you understand it.

[Start learning](https://learn.significanthobbies.com/dashboard)
