import { ArrowRight, BookOpen, Code2, Dumbbell, Hammer, Layers, Map, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BentoGrid, BentoGridItem } from '../components/bento-grid';
import { HoverEffectCards } from '../components/hover-effect-cards';
import { SaaSMakerTestimonials } from '../components/saasmaker-feedback';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const PRINCIPLES = [
  {
    icon: Target,
    title: 'Always answer "what next?"',
    body: 'The dashboard picks one concept to learn, one drill to solve, and the reviews that are due. No decision fatigue.',
  },
  {
    icon: Hammer,
    title: 'No learning without an artifact',
    body: 'Every concept maps to drills and something you build — code, a benchmark, a design doc. Theory becomes proof.',
  },
  {
    icon: Map,
    title: 'Roadmaps with real progress',
    body: 'Structured paths from a 9-day reset to a 12-month run at AI infrastructure depth. Progress is mastered concepts, not pages read.',
  },
];

const STEPS = [
  {
    title: 'Pick a concept',
    body: 'Browse 125 concepts across 8 tracks — search, vector databases, AI systems, backend, storage — or let the dashboard pick.',
  },
  {
    title: 'Drill it, then build it',
    body: 'Solve focused drills, then ship the artifact in the Playground. A concept is not learned until an artifact exists.',
  },
  {
    title: 'Review and compound',
    body: 'FSRS spaced repetition surfaces concepts right before you forget. The progress page tracks whether learning is compounding.',
  },
];

const ROADMAPS = [
  { title: 'Vector DBs', description: 'HNSW, IVF, quantization, billion-scale serving.', to: '/learn' },
  { title: 'Search & IR', description: 'Inverted index, ranking, BM25, learned retrieval.', to: '/learn' },
  { title: 'AI systems', description: 'Inference servers, KV cache, tool use, eval.', to: '/learn' },
  { title: 'Disk-first DBs', description: 'Pages, WAL, B-trees, LSMs — Andy Pavlo end-to-end.', to: '/learn' },
  { title: 'Runtimes', description: 'V8, JVM, Go, BEAM, vLLM — the 5 jobs every runtime does.', to: '/learn' },
  { title: 'SWE landscape', description: 'A tour of every major systems-software domain in 2026.', to: '/learn' },
];

export default function Login() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setDebugInfo(clientId ? 'Client ID configured' : 'Missing VITE_GOOGLE_CLIENT_ID');
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
              <BookOpen className="h-4 w-4 text-sky-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-100">SWE Prep</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={continueAsGuest}
              className="text-xs text-slate-400 transition-colors hover:text-slate-200"
            >
              Continue as guest
            </button>
            <Button onClick={signInWithGoogle} size="sm" variant="primary">
              Sign in with Google
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — typography-led, zero ornament */}
      <section className="mx-auto w-full max-w-4xl px-6 pt-24 pb-16 sm:pt-32">
        <p className="mb-4 text-sm font-medium text-sky-400">A learning OS for systems software</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          Learn deeply. Practice with intent.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base text-slate-300 sm:text-lg">
          Concept → Drill → Build → Review → Apply. A focused loop for engineers who want to actually <em className="not-italic font-medium text-slate-100">understand</em> the systems they work on — databases, search, vector indexes, runtimes, AI inference.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={continueAsGuest} variant="primary" size="lg" className="w-full sm:w-auto">
            Start learning <ArrowRight className="h-4 w-4" />
          </Button>
          <Button onClick={signInWithGoogle} variant="secondary" size="lg" className="w-full sm:w-auto">
            Sign in with Google
          </Button>
          <span className="text-xs text-slate-500 sm:ml-2">No sign-up needed to start. FSRS reviews need an account.</span>
        </div>
        {import.meta.env.DEV && debugInfo && (
          <p className="mt-4 text-xs text-slate-600">{debugInfo}</p>
        )}
      </section>

      {/* The loop — three principles, one bento */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">The loop</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Five steps, repeated. The dashboard always knows where you are.
          </p>
        </div>
        <BentoGrid className="md:auto-rows-[12rem]">
          {PRINCIPLES.map(({ icon: Icon, title, body }, i) => (
            <BentoGridItem
              key={title}
              index={i}
              icon={<Icon className="h-4 w-4" />}
              title={title}
              description={body}
              className={i === 0 ? 'md:col-span-2' : ''}
            />
          ))}
        </BentoGrid>
      </section>

      {/* Roadmaps — HoverEffect cards (Aceternity) */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-100">Roadmaps</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Six curated paths. Each one maps concepts → drills → artifacts so progress is provable.
            </p>
          </div>
        </div>
        <HoverEffectCards items={ROADMAPS} />
      </section>

      {/* The three surfaces */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">Three surfaces, one loop</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Learn what's next, drill it, ship it. Track mastery in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SurfaceCard
            icon={<Layers className="h-4 w-4" />}
            title="Learn"
            body="Roadmaps and a 125-concept library. Track mastery with FSRS — concepts surface right before you forget."
          />
          <SurfaceCard
            icon={<Dumbbell className="h-4 w-4" />}
            title="Practice"
            body="66 drills tuned to your ELO. Spaced reviews keep what you've learned from decaying."
          />
          <SurfaceCard
            icon={<Code2 className="h-4 w-4" />}
            title="Playground"
            body="Monaco + Excalidraw + Socratic AI + a Feynman gate. Build the artifact; explain it back."
          />
        </div>
      </section>

      {/* How it works — numbered, but the numbers earn it (real sequence) */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">How a session looks</h2>
        </div>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="text-xs font-medium text-slate-500">Step {i + 1}</div>
              <h3 className="mt-2 text-base font-semibold text-slate-100">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Social proof */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16">
        <h2 className="mb-6 text-sm font-medium text-slate-400">What users say</h2>
        <SaaSMakerTestimonials />
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800/80 bg-slate-950 py-16">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
            Start the loop today.
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            No sign-up to try it. Sign in when you want FSRS to remember what you've learned.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button onClick={continueAsGuest} variant="primary" size="lg">
              Continue as guest
            </Button>
            <Button onClick={signInWithGoogle} variant="secondary" size="lg">
              Sign in with Google
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/80 py-10 text-center">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} SWE Prep ·{' '}
          <a href="/privacy" className="text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline">
            Privacy
          </a>{' '}
          ·{' '}
          <a href="/about" className="text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline">
            About
          </a>
        </p>
      </footer>
    </div>
  );
}

function SurfaceCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors duration-150 hover:border-slate-700">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-950 text-sky-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{body}</p>
    </div>
  );
}
