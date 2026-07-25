import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import curriculumSummary from '../data/public-curriculum-summary.json';
import { SiteHeader } from '../components/SiteHeader';

const PRINCIPLES = [
  {
    title: 'Always answer "what next?"',
    body: 'The dashboard picks one concept to learn, one drill to solve, and the reviews that are due. No decision fatigue.',
  },
  {
    title: 'No learning without an artifact',
    body: 'Every concept maps to drills and something you build — code, a benchmark, a design doc. Theory becomes proof.',
  },
  {
    title: 'Roadmaps with real progress',
    body: 'Structured paths from a 9-day reset to a 12-month run at AI infrastructure depth. Progress is mastered concepts, not pages read.',
  },
];

const SURFACES = [
  {
    tag: '01',
    title: 'Today',
    body: 'One plan: concept → drill → artifact → review. Like roadmap.sh, but you ship code.',
  },
  {
    tag: '02',
    title: 'Practice',
    body: `${curriculumSummary.counts.drills} focused drills connect concepts to executable practice. FSRS keeps it sticky.`,
  },
  {
    tag: '03',
    title: 'Playground',
    body: 'Monaco + Excalidraw + Socratic AI + a Feynman gate. Build the artifact; explain it back.',
  },
];

const STEPS = [
  {
    tag: '01',
    title: 'Pick a path',
    body: 'Onboarding picks your roadmap. Today always shows the next checkbox.',
  },
  {
    tag: '02',
    title: 'Drill, then build',
    body: 'Solve focused drills, then ship the artifact in the Playground. Not learned until it exists.',
  },
  {
    tag: '03',
    title: 'Review and compound',
    body: 'FSRS spaced repetition keeps it sticky. Progress is whether learning is compounding.',
  },
];

export default function Login() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<string>('');

  const startMockAsGuest = () => {
    continueAsGuest();
    navigate('/mock');
  };

  useEffect(() => {
    document.getElementById('lcp-shell')?.remove();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setDebugInfo(clientId ? 'Client ID configured' : 'Missing VITE_GOOGLE_CLIENT_ID');
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <SiteHeader
        onNavigate={continueAsGuest}
        actions={
          <>
            <button
              onClick={continueAsGuest}
              className="hidden px-2 py-1.5 font-mono text-xs text-white/50 transition-colors hover:text-white sm:inline-flex"
            >
              Guest
            </button>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/90"
            >
              Sign in
            </button>
          </>
        }
      />

      <main id="main-content">
        {/* Hero */}
        <section className="relative">
          <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
          <div className="mx-auto w-full max-w-5xl px-6 pt-24 pb-20 sm:pt-32 lg:pt-40">
            <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              A learning OS for systems software
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Learn deeply.
              <br />
              <span className="text-white/40">Practice with intent.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
              Concept → Drill → Build → Review → Apply. A focused loop for engineers who want to
              actually <em className="not-italic text-white">understand</em> the systems they work
              on — databases, search, vector indexes, runtimes, AI inference.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={continueAsGuest}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90"
              >
                Start learning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={startMockAsGuest}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/5"
              >
                Try a mock interview
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/5"
              >
                Sign in with Google
              </button>
              <span className="font-mono text-xs text-white/40">No sign-up needed to start.</span>
            </div>
            {import.meta.env.DEV && debugInfo && (
              <p className="mt-6 font-mono text-xs text-white/30">{debugInfo}</p>
            )}
          </div>
        </section>

        {/* Principles */}
        <section className="border-t border-white/[0.08]">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-12 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              The loop
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              {PRINCIPLES.map((p, i) => (
                <div key={p.title}>
                  <div className="mb-3 font-mono text-xs text-white/30">0{i + 1}</div>
                  <h3 className="text-lg font-semibold tracking-tight text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Surfaces */}
        <section className="border-t border-white/[0.08]">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-12 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              Three surfaces, one loop
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              {SURFACES.map((s) => (
                <div key={s.title}>
                  <div className="mb-3 font-mono text-xs text-white/30">{s.tag}</div>
                  <h3 className="text-lg font-semibold tracking-tight text-white">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Public curriculum */}
        <section className="border-t border-white/[0.08]">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              Public curriculum
            </div>
            <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
                  {curriculumSummary.counts.tracks} tracks. {curriculumSummary.counts.concepts}{' '}
                  concepts. One connected map.
                </h2>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                  Browse systems, infrastructure, distributed systems, databases, AI training and
                  inference, agents, reliability, developer tools, application engineering,
                  multimodal computing, DSA, design, mathematics, search, and product engineering.
                  Every public concept includes a mental model, primary source, practice direction,
                  review prompt, and path to build evidence.
                </p>
              </div>
              <a
                href="/curriculum/"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Browse curriculum <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
              {curriculumSummary.tracks.map((track) => (
                <a
                  key={track.id}
                  href={`/curriculum/tracks/${track.id}.html`}
                  className="bg-black p-5 transition-colors hover:bg-white/[0.04]"
                >
                  <h3 className="text-sm font-semibold text-white">{track.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/50">{track.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* How a session looks */}
        <section className="border-t border-white/[0.08]">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <div className="mb-12 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              How a session looks
            </div>
            <ol className="grid gap-12 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.title}>
                  <div className="mb-3 font-mono text-xs text-white/30">{s.tag}</div>
                  <h3 className="text-lg font-semibold tracking-tight text-white">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative border-t border-white/[0.08]">
          <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
          <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Start the loop today.
            </h2>
            <p className="mt-4 text-sm text-white/60 sm:text-base">
              No sign-up to try it. Sign in when you want FSRS to remember what you've learned.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={continueAsGuest}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
              >
                Continue as guest <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:border-white/30 hover:bg-white/5"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] py-10 text-center">
        <p className="font-mono text-xs text-white/40">
          © {new Date().getFullYear()} SWE Prep ·{' '}
          <Link to="/privacy" className="text-white/60 hover:text-white">
            Privacy
          </Link>{' '}
          ·{' '}
          <Link to="/about" className="text-white/60 hover:text-white">
            About
          </Link>
        </p>
      </footer>
    </div>
  );
}
