import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-gray-200">
      <Link to="/" className="text-xs text-gray-500 hover:text-blue-400">
        ← Loop
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">About</h1>
      <p className="mt-4 text-sm leading-7 text-gray-300">
        Loop is an SWE interview prep tool built around four screens: Today,
        Playground, Concepts, Review. No nav drawer, no menus &mdash; everything
        feeds the playground or learns from it.
      </p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">The four pages</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
        <li>
          <Link to="/" className="underline">Today</Link> &mdash; one AI-generated
          recommendation card based on your FSRS state.
        </li>
        <li>
          <Link to="/playground" className="underline">Playground</Link> &mdash; Monaco
          editor + Excalidraw diagrams + a Socratic AI companion + the
          Feynman Gate (explain it back, get graded 0&ndash;100).
        </li>
        <li>
          <Link to="/learn" className="underline">Concepts</Link> &mdash; FSRS
          mastery heatmap across a 60-concept taxonomy (DSA / LLD / HLD / Behavioral).
        </li>
        <li>
          <Link to="/review" className="underline">Review</Link> &mdash; weekly AI
          report summarizing what you actually learned vs. what you ground.
        </li>
      </ul>

      <h2 className="mt-8 text-base font-semibold text-blue-400">Why FSRS</h2>
      <p className="mt-2 text-sm leading-7 text-gray-300">
        Confidence isn&apos;t binary. Loop uses FSRS spaced repetition with a
        decay curve <code className="rounded bg-gray-800 px-1 text-blue-300">(1 + elapsed / (9 &times; stability))^-1</code>{' '}
        so you can see mastery slip over time on the heatmap and Today
        surfaces what&apos;s actually fading.
      </p>

      <h2 className="mt-8 text-base font-semibold text-blue-400">Bring your own AI</h2>
      <p className="mt-2 text-sm leading-7 text-gray-300">
        Configure any OpenAI-compatible <code className="rounded bg-gray-800 px-1 text-blue-300">endpointUrl</code> + key + model in
        settings. The Socratic companion, auto-tagger, and Feynman grader all use
        the same adapter. Local dev can use the bundled Express bridge that proxies
        <code className="rounded bg-gray-800 px-1 text-blue-300"> claude</code> /
        <code className="rounded bg-gray-800 px-1 text-blue-300"> codex</code> /
        <code className="rounded bg-gray-800 px-1 text-blue-300"> gemini</code> CLIs.
      </p>

      <h2 className="mt-10 text-base font-semibold text-cyan-400">Research basis</h2>
      <p className="mt-2 text-sm leading-7 text-gray-300">
        Loop is positioned as <em>cognitive fitness through hard novel problems at the edge
        of skill in your chosen domain</em>. The defensible mechanism is <strong>cognitive
        reserve</strong> — compounding crystallized intelligence in a complex domain to
        resist later decline — not raising fluid intelligence (mostly fixed after ~25).
        Below are the load-bearing sources behind the design.
      </p>

      <h3 className="mt-6 text-sm font-semibold text-gray-200">What works</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
        <li>
          <strong>Cognitive reserve</strong> — Stern, <em>Lancet Neurology</em> 2012.
          Education, occupational complexity, and lifelong cognitive engagement
          attenuate the clinical impact of equivalent neuropathology.
          {' '}<a href="https://www.thelancet.com/article/S1474-4422(12)70191-6/abstract" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>Aerobic exercise → hippocampal volume</strong> — Erickson et al.,
          <em> PNAS</em> 2011. 12 mo moderate aerobic training reversed ~1-2 years of
          age-related hippocampal atrophy; gains correlated with BDNF.
          {' '}<a href="https://www.pnas.org/doi/10.1073/pnas.1015950108" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>Expertise = chunking, not bigger RAM</strong> — Chase &amp; Simon 1973.
          Chess masters recall real positions far better than novices but match them
          on random positions. Same 4 working-memory slots, bigger units.
          {' '}<a href="http://chrest.info/fg/papers/Meaningless/Meaningless.html" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>Retrieval practice / testing effect</strong> — Roediger &amp; Karpicke
          2006. Free recall produces ~50% better long-term retention than re-reading.
          Meta-analytic effect size g ≈ 0.5-0.7. Powers FSRS + the Feynman Gate.
        </li>
        <li>
          <strong>Desirable difficulties</strong> — Bjork. Spacing, interleaving, and
          retrieval feel worse in the moment and produce durably better learning.
          Drives the cross-track interleaving and Recommended row in Practice.
          {' '}<a href="https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-introducing-desirable-difficulties-into-practice-and-instruction-bjork-and-bjork.pdf" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>Processing-speed theory of aging</strong> — Salthouse. Speed-of-processing
          decline accounts for 70-90% of age-related variance in reasoning tasks.
          Why post-25 strategy is compounding domain knowledge (Gc), not chasing fluid
          intelligence (Gf).
        </li>
        <li>
          <strong>Glymphatic clearance during sleep</strong> — Xie et al., <em>Science</em>{' '}
          2013. Interstitial waste clearance is ~2x faster during sleep. Why
          sleep is treated as upstream of any cognitive work.
          {' '}<a href="https://pubmed.ncbi.nlm.nih.gov/24136970/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold text-gray-200">What doesn't (and why this isn't a brain-training app)</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
        <li>
          <strong>Brain-training games</strong> — Simons et al. 2016 review in
          <em> Psychological Science in the Public Interest</em>: robust near transfer,
          no compelling far transfer, no real-world cognitive benefits.
          {' '}<a href="https://journals.sagepub.com/doi/abs/10.1177/1529100616661983" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>Lumosity</strong> — FTC fined $2M in 2016 for unsupported claims of
          school / work / age-related benefits.
          {' '}<a href="https://www.ftc.gov/news-events/news/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges-its-brain-training-program" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>Working-memory training</strong> — Jaeggi 2008 dual N-back result
          has largely failed to replicate (Redick 2013; Melby-Lervåg meta-analyses).
          WM slot count is fixed; effective capacity scales via chunking in LTM.
        </li>
        <li>
          <strong>Deliberate-practice as sole predictor</strong> — Macnamara, Hambrick
          &amp; Oswald 2014: ~4% variance in education, &lt;1% in professions.
          Practice matters, but the strong "10,000 hours" claim is empirically wrong.
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold text-gray-200">The offloading question (Focus mode)</h3>
      <p className="mt-2 text-sm leading-7 text-gray-300">
        Tools that perform generation for you can atrophy what they replace. Focus
        mode is the audit affordance — a deliberate "no AI assist" mode you can flip
        on, tracking how often you train without scaffolding.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
        <li>
          <strong>GPS → hippocampal decline</strong> — Dahmani &amp; Bohbot 2020.
          Heavy lifetime GPS use linked to worse spatial memory; longitudinal subsample
          showed steeper hippocampal-dependent decline in heavy users.
          {' '}<a href="https://www.nature.com/articles/s41598-020-62877-0" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>London taxi drivers (positive case)</strong> — Maguire et al. 2006.
          Years of "Knowledge" training correlated with posterior-hippocampal gray-matter
          enlargement. Experience-dependent plasticity, both directions.
          {' '}<a href="https://www.fil.ion.ucl.ac.uk/Maguire/Maguire2006.pdf" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>Photo-taking impairment effect</strong> — Henkel 2014. Photographing
          museum objects produced worse recognition and detail memory than just
          observing them.
          {' '}<a href="https://journals.sagepub.com/doi/abs/10.1177/0956797613504438" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>LLMs &amp; cognitive engagement</strong> — Lee et al. (Microsoft / CMU)
          CHI 2025. Higher confidence in AI correlated with reduced critical-thinking
          engagement; work shifts from generation to verification.
          {' '}<a href="https://www.microsoft.com/en-us/research/wp-content/uploads/2025/01/lee_2025_ai_critical_thinking_survey.pdf" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
        <li>
          <strong>LLMs &amp; neural engagement during writing</strong> — Kosmyna et al.
          MIT Media Lab 2025. LLM-assisted writing showed weakest neural connectivity
          (alpha / theta bands) and worst recall of own writing. Preprint, n=54.
          {' '}<a href="https://arxiv.org/abs/2506.08872" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>
        </li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold text-gray-200">Design principles applied here</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-300">
        <li><strong>Production before consumption</strong> — Feynman Gate forces you to commit before any AI feedback (generation effect).</li>
        <li><strong>Retrieval before recognition</strong> — Reviews ask free-recall, not multiple-choice (testing effect, g ≈ 0.5-0.7).</li>
        <li><strong>Desirable difficulty</strong> — Spacing (FSRS), interleaving, retrieval over re-reading. Feels worse, works better.</li>
        <li><strong>Socratic refusal</strong> — The Companion probes; it doesn't give solutions when learning is the goal.</li>
        <li><strong>Edge-of-competence calibration</strong> — Per-track ELO picks drills near your current level. No leaderboard; the number is diagnostic, not the goal.</li>
        <li><strong>Force the explain-back</strong> — Feynman Gate grades 0-100 with surfaced gaps. The deep-processing step LLM-assist tends to skip.</li>
        <li><strong>Audit offloaded capacities</strong> — Focus mode tracks no-tools sessions per week. If you can't do it without the tool, you've offloaded the capacity, not augmented it.</li>
      </ol>
    </main>
  );
}
