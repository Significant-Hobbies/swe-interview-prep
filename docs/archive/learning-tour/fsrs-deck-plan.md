# FSRS Deck Plan — Fleet Learning Tour Cards

Plan for converting fleet `decisions.md` and `lessons.md` files into FSRS
flashcards using the `ts-fsrs` library already in this project.

This is a plan doc — no implementation yet.

---

## Card schema

The existing FSRS cards in this project use the `Card` type from `ts-fsrs` plus
a domain-specific wrapper stored in Turso. A fleet learning card extends that
with two extra fields:

```typescript
// Extends the existing concept card shape in src/data/concepts.json
interface FleetLearningCard {
  id: string;              // e.g. "fleet:tinygpt:decision:wasm-vs-webgpu"
  front: string;           // Question / prompt
  back: string;            // Answer / explanation
  source: string;          // Relative path to the source doc
  project: string;         // e.g. "tinygpt"
  track: "ml" | "systems" | "web-platform";
  kind: "decision" | "lesson" | "retro";
  fsrs: Card;              // ts-fsrs Card object (due, stability, difficulty, …)
}
```

Example card derived from `tinygpt/docs/decision_log.md`:

```
front: "Why did tinygpt choose MLX over PyTorch for the Mac training path?"
back:  "MLX maps directly to Apple Silicon's unified memory — no CPU↔GPU copy
        overhead. PyTorch MPS still required explicit device placement and had
        higher peak RAM. Decision log: tinygpt/docs/decision_log.md"
source: "../../../tinygpt/docs/decision_log.md"
project: "tinygpt"
track: "ml"
kind: "decision"
```

---

## Source files to ingest

### ML track

| Project | Files |
|---------|-------|
| tinygpt | `docs/decision_log.md`, `docs/lessons.md`, `docs/learn/curriculum.md` |
| researchPapers | `docs/decisions.md`, `docs/lessons.md` |
| high-signal | `docs/decisions.md`, `docs/lessons.md` |
| looptv | `docs/decisions.md`, `docs/lessons.md` |
| email-manager | `docs/decisions.md`, `docs/lessons.md` |

### Systems track

| Project | Files |
|---------|-------|
| port-whisperer | `docs/decisions.md`, `docs/lessons.md` |
| event-forecast | `docs/decisions.md`, `docs/lessons.md` |
| free-ai | `docs/decisions.md`, `docs/lessons.md` |
| pace | `docs/architecture.md` |

### Web-platform track

| Project | Files |
|---------|-------|
| ai-game | `docs/decisions.md`, `docs/lessons.md` |
| starboard | `docs/decisions.md`, `docs/lessons.md` |
| reader | `docs/decisions.md`, `docs/lessons.md` |
| saas-maker | `docs/droid.md`, `docs/symphony.md` |

---

## Wiring into the study UI

1. **Ingest script** (`scripts/ingest-fleet-cards.ts`): parse each source file,
   extract H2/H3 sections, generate `FleetLearningCard[]`, upsert into a new
   `fleet_cards` Turso table. Run once manually; re-run when source docs change.

2. **Category filter**: the existing Concepts page already filters by category
   (`DSA`, `ML`, etc.). Add `Fleet` as a new category backed by `fleet_cards`
   rather than `concepts.json`. Minimal UI change.

3. **Review flow**: reuse the existing `useSpacedRepetition` hook — it already
   calls `ts-fsrs`'s `fsrs()` scheduler and writes back to Turso. The
   `FleetLearningCard` shape is compatible with the hook's `Card` interface
   because `fsrs` is a pass-through field.

4. **Source link**: the card back always includes a link to the source doc. In
   review mode, render it as a "read original" button that opens the markdown
   file (or a future dynamic route if docs get web-visible).

---

## Open questions

- Should retro cards be separate from decision/lesson cards, or merged? Retros
  tend to be narrative (paragraph-form) rather than Q&A — they may need a
  different card template.
- Card generation: manual curation vs LLM-assisted extraction? Manual keeps
  quality high but is slow at scale. A one-shot extraction pass with human
  review is a reasonable middle ground.
