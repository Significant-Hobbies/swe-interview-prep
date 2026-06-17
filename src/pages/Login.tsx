import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SaaSMakerTestimonials } from '../components/saasmaker-feedback';
import { useAuth } from '../contexts/AuthContext';

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
  { tag: '01', title: 'Learn', body: 'Roadmaps and a 125-concept library. FSRS surfaces concepts right before you forget.' },
  { tag: '02', title: 'Practice', body: '66 drills tuned to your ELO. Spaced reviews keep what you\'ve learned from decaying.' },
  { tag: '03', title: 'Playground', body: 'Monaco + Excalidraw + Socratic AI + a Feynman gate. Build the artifact; explain it back.' },
];

const STEPS = [
  { tag: '01', title: 'Pick a concept', body: 'Browse 125 concepts or let the dashboard pick. The hero is always "what next".' },
  { tag: '02', title: 'Drill, then build', body: 'Solve focused drills, then ship the artifact in the Playground. Not learned until it exists.' },
  { tag: '03', title: 'Review and compound', body: 'FSRS spaced repetition keeps it sticky. Progress is whether learning is compounding.' },
];

export default function Login() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setDebugInfo(clientId ? 'Client ID configured' : 'Missing VITE_GOOGLE_CLIENT_ID');
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">SWE Prep</span>
            <span className="hidden text-xs text-white/30 sm:inline">/ Learning OS</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={continueAsGuest}
              className="font-mono text-xs text-white/50 transition-colors hover:text-white"
            >
              Continue as guest
            </button>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/90"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="mx-auto w-full max-w-5xl px-6 pt-24 pb-20 sm:pt-32 lg:pt-40">
          <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            A learning OS for systems software
          </div>
          <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Learn deeply.<br />
            <span className="text-white/40">Practice with intent.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
            Concept → Drill → Build → Review → Apply. A focused loop for engineers who want to actually <em className="not-italic text-white">understand</em> the systems they work on — databases, search, vector indexes, runtimes, AI inference.
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
              onClick={signInWithGoogle}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/5"
            >
              Sign in with Google
            </button>
            <span className="font-mono text-xs text-white/40">
              No sign-up needed to start.
            </span>
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
            {SURFACES.map(s => (
              <div key={s.title}>
                <div className="mb-3 font-mono text-xs text-white/30">{s.tag}</div>
                <h3 className="text-lg font-semibold tracking-tight text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{s.body}</p>
              </div>
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
            {STEPS.map(s => (
              <li key={s.title}>
                <div className="mb-3 font-mono text-xs text-white/30">{s.tag}</div>
                <h3 className="text-lg font-semibold tracking-tight text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-white/[0.08]">
        <div className="mx-auto w-full max-w-3xl px-6 py-20">
          <div className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            What users say
          </div>
          <SaaSMakerTestimonials />
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

      <footer className="border-t border-white/[0.08] py-10 text-center">
        <p className="font-mono text-xs text-white/40">
          © {new Date().getFullYear()} SWE Prep ·{' '}
          <a href="/privacy" className="text-white/60 hover:text-white">Privacy</a>{' '}
          ·{' '}
          <a href="/about" className="text-white/60 hover:text-white">About</a>
        </p>
      </footer>
    </div>
  );
}
