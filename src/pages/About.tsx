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
    </main>
  );
}
