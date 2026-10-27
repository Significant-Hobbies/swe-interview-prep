# About

> The learning model, tools, research basis, and design principles behind SWE Interview Prep.

Canonical: https://learn.significanthobbies.com/about

[← Loop](https://learn.significanthobbies.com/)

# About

Loop is an SWE interview prep tool built around four screens: Today, Playground, Concepts, Review. No nav drawer, no menus — everything feeds the playground or learns from it.

## The four pages

- [Today](https://learn.significanthobbies.com/) — one AI-generated recommendation card based on your FSRS state.

- [Playground](https://learn.significanthobbies.com/playground) — Monaco editor + Excalidraw diagrams + a Socratic AI companion + the Feynman Gate (explain it back, get graded 0–100).

- [Concepts](https://learn.significanthobbies.com/learn) — FSRS mastery heatmap across a 60-concept taxonomy (DSA / LLD / HLD / Behavioral).

- [Review](https://learn.significanthobbies.com/review) — weekly AI report summarizing what you actually learned vs. what you ground.

## Why FSRS

Confidence isn't binary. Loop uses FSRS spaced repetition with a decay curve `(1 + elapsed / (9 × stability))^-1` so you can see mastery slip over time on the heatmap and Today surfaces what's actually fading.

## Bring your own AI

Configure any OpenAI-compatible `endpointUrl` + key + model in settings. The Socratic companion, auto-tagger, and Feynman grader all use the same adapter. Local dev can use the bundled Express bridge that proxies` claude` /` codex` /` gemini` CLIs.

## Research basis

Loop is positioned as *cognitive fitness through hard novel problems at the edge of skill in your chosen domain*. The defensible mechanism is **cognitive reserve** — compounding crystallized intelligence in a complex domain to resist later decline — not raising fluid intelligence (mostly fixed after ~25). Below are the load-bearing sources behind the design.

### What works

- **Cognitive reserve** — Stern, *Lancet Neurology* 2012. Education, occupational complexity, and lifelong cognitive engagement attenuate the clinical impact of equivalent neuropathology. [link](https://www.thelancet.com/article/S1474-4422(12)70191-6/abstract)

- **Aerobic exercise → hippocampal volume** — Erickson et al.,* PNAS* 2011. 12 mo moderate aerobic training reversed ~1-2 years of age-related hippocampal atrophy; gains correlated with BDNF. [link](https://www.pnas.org/doi/10.1073/pnas.1015950108)

- **Expertise = chunking, not bigger RAM** — Chase & Simon 1973. Chess masters recall real positions far better than novices but match them on random positions. Same 4 working-memory slots, bigger units. [link](http://chrest.info/fg/papers/Meaningless/Meaningless.html)

- **Retrieval practice / testing effect** — Roediger & Karpicke 2006. Free recall produces ~50% better long-term retention than re-reading. Meta-analytic effect size g ≈ 0.5-0.7. Powers FSRS + the Feynman Gate.

- **Desirable difficulties** — Bjork. Spacing, interleaving, and retrieval feel worse in the moment and produce durably better learning. Drives the cross-track interleaving and Recommended row in Practice. [link](https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-introducing-desirable-difficulties-into-practice-and-instruction-bjork-and-bjork.pdf)

- **Processing-speed theory of aging** — Salthouse. Speed-of-processing decline accounts for 70-90% of age-related variance in reasoning tasks. Why post-25 strategy is compounding domain knowledge (Gc), not chasing fluid intelligence (Gf).

- **Glymphatic clearance during sleep** — Xie et al., *Science* 2013. Interstitial waste clearance is ~2x faster during sleep. Why sleep is treated as upstream of any cognitive work. [link](https://pubmed.ncbi.nlm.nih.gov/24136970/)

### What doesn't (and why this isn't a brain-training app)

- **Brain-training games** — Simons et al. 2016 review in* Psychological Science in the Public Interest*: robust near transfer, no compelling far transfer, no real-world cognitive benefits. [link](https://journals.sagepub.com/doi/abs/10.1177/1529100616661983)

- **Lumosity** — FTC fined $2M in 2016 for unsupported claims of school / work / age-related benefits. [link](https://www.ftc.gov/news-events/news/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges-its-brain-training-program)

- **Working-memory training** — Jaeggi 2008 dual N-back result has largely failed to replicate (Redick 2013; Melby-Lervåg meta-analyses). WM slot count is fixed; effective capacity scales via chunking in LTM.

- **Deliberate-practice as sole predictor** — Macnamara, Hambrick & Oswald 2014: ~4% variance in education, <1% in professions. Practice matters, but the strong "10,000 hours" claim is empirically wrong.

### The offloading question (Focus mode)

Tools that perform generation for you can atrophy what they replace. Focus mode is the audit affordance — a deliberate "no AI assist" mode you can flip on, tracking how often you train without scaffolding.

- **GPS → hippocampal decline** — Dahmani & Bohbot 2020. Heavy lifetime GPS use linked to worse spatial memory; longitudinal subsample showed steeper hippocampal-dependent decline in heavy users. [link](https://www.nature.com/articles/s41598-020-62877-0)

- **London taxi drivers (positive case)** — Maguire et al. 2006. Years of "Knowledge" training correlated with posterior-hippocampal gray-matter enlargement. Experience-dependent plasticity, both directions. [link](https://www.fil.ion.ucl.ac.uk/Maguire/Maguire2006.pdf)

- **Photo-taking impairment effect** — Henkel 2014. Photographing museum objects produced worse recognition and detail memory than just observing them. [link](https://journals.sagepub.com/doi/abs/10.1177/0956797613504438)

- **LLMs & cognitive engagement** — Lee et al. (Microsoft / CMU) CHI 2025. Higher confidence in AI correlated with reduced critical-thinking engagement; work shifts from generation to verification. [link](https://www.microsoft.com/en-us/research/wp-content/uploads/2025/01/lee_2025_ai_critical_thinking_survey.pdf)

- **LLMs & neural engagement during writing** — Kosmyna et al. MIT Media Lab 2025. LLM-assisted writing showed weakest neural connectivity (alpha / theta bands) and worst recall of own writing. Preprint, n=54. [link](https://arxiv.org/abs/2506.08872)

### Design principles applied here

- **Production before consumption** — Feynman Gate forces you to commit before any AI feedback (generation effect).

- **Retrieval before recognition** — Reviews ask free-recall, not multiple-choice (testing effect, g ≈ 0.5-0.7).

- **Desirable difficulty** — Spacing (FSRS), interleaving, retrieval over re-reading. Feels worse, works better.

- **Socratic refusal** — The Companion probes; it doesn't give solutions when learning is the goal.

- **Edge-of-competence calibration** — Per-track ELO picks drills near your current level. No leaderboard; the number is diagnostic, not the goal.

- **Force the explain-back** — Feynman Gate grades 0-100 with surfaced gaps. The deep-processing step LLM-assist tends to skip.

- **Audit offloaded capacities** — Focus mode tracks no-tools sessions per week. If you can't do it without the tool, you've offloaded the capacity, not augmented it.