# Mock Interview Readiness: Screenshot Shot List (v2)

> v2 rewrite — corrected routes to match actual app (`/mock`, `/practice`, `/learn`, `/playground`, `/progress`).
> Related assets: [write-reddit-safe-launch-draft.md](./write-reddit-safe-launch-draft.md), [write-founder-launch-note.md](./write-founder-launch-note.md)

---

## 1. Mock Interview Setup Screen

- **Route/State:** `/mock` — no active session (pre-start config panel visible)
- **Caption:** "Dial in your mock interview. Set role, duration, and which rounds to include — DSA, system design, or behavioral."
- **Why it sells:** First impression of the mock. Shows customization depth and that it covers all three interview round types. Signals "this is built for real FAANG-style loops, not generic quiz apps."
- **Platform:** Desktop

---

## 2. Live Coding Question (DSA turn in-flight)

- **Route/State:** `/mock` — active session, `session.status === 'active'`, current turn type `dsa`; code editor visible with a question prompt
- **Caption:** "Write real code under timed pressure. The AI grades your complexity analysis, correctness, and communication — just like a live loop."
- **Why it sells:** The integrated code + answer panel is the core differentiator from flashcard tools. Shows that the platform simulates the actual interview pressure loop.
- **Platform:** Desktop

---

## 3. System Design Turn (HLD/LLD with diagram input)

- **Route/State:** `/mock` — active session, current turn type `hld` or `lld`; diagram summary text area visible alongside the question
- **Caption:** "Sketch your architecture. Paste a diagram summary and the AI evaluates your depth, trade-offs, and component reasoning."
- **Why it sells:** System design is the hardest round for IC4–IC6 candidates. Showing native HLD/LLD support positions this above pure DSA tools. Appeals to senior engineers.
- **Platform:** Desktop

---

## 4. Behavioral Turn (in-flight answer)

- **Route/State:** `/mock` — active session, current turn type `behavioral`; text area with a behavioral prompt showing
- **Caption:** "STAR framing, live. Get real-time structure coaching on your behavioral answers before the real interview."
- **Why it sells:** Most engineers underestimate behavioral rounds. This screenshot speaks directly to candidates who know they're weak on STAR structure.
- **Platform:** Desktop & Mobile

---

## 5. Post-Interview Score Summary

- **Route/State:** `/mock` — `session.status === 'complete'`; summary panel showing Overall score, Turns completed, weak topic, missed patterns, and review cards
- **Caption:** "Score: 82/100. Weak area: Communication. 3 review cards queued. Your loop analyzed in 30 seconds."
- **Why it sells:** The feedback loop is the retention driver. Showing a real score with actionable weak areas — not just "good job" — signals this is serious practice, not gamified busywork.
- **Platform:** Desktop

---

## 6. Practice → Drills Tab (track-filtered drill list)

- **Route/State:** `/practice` (default tab `drills`), track filter set to e.g. `dsa` or `backend`
- **Caption:** "8 tracks, 60+ drills. Filter by what your interview loop actually tests — DSA, backend, system design, or AI systems."
- **Why it sells:** Breadth signal. Shows this isn't a single-topic tool. Track filtering visualizes the curriculum without requiring a walkthrough.
- **Platform:** Desktop & Mobile

---

## 7. Practice → Reviews Tab (FSRS spaced repetition card)

- **Route/State:** `/practice?tab=reviews` — a review card visible with concept question shown, answer hidden (pre-reveal state)
- **Caption:** "Never blank on a concept again. Spaced repetition resurfaces exactly what you're forgetting — timed to your interview date."
- **Why it sells:** FSRS is a scientifically proven method. "Timed to your interview date" is a concrete, emotionally resonant hook for anxious candidates cramming in the final weeks.
- **Platform:** Mobile (portrait, shows mobile-first UX value)

---

## 8. Learn Tab — Concept Detail with Mastery Ring

- **Route/State:** `/learn/:id` — a concept detail page (e.g. a vector DB or distributed systems concept) with the mastery donut/ring visible and FSRS decay shown
- **Caption:** "Know exactly how well you know it. Mastery decays over time — so the system keeps you sharp on the concepts that matter."
- **Why it sells:** Mastery visualization is the "aha" moment for engineers who have studied hard but still blank in interviews. It makes the invisible (knowledge decay) visible and positions the product as honest about readiness, not just motivating.
- **Platform:** Desktop
