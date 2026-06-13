import { Boxes, CheckCircle, ChevronRight, Clock, Code2, Hammer, Layout as LayoutIcon, Map as MapIcon, Server, Sparkles, Target, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SaaSMakerTestimonials } from '../components/saasmaker-feedback';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  {
    icon: Target,
    title: 'Always answers "what next?"',
    body: 'The dashboard picks one concept to learn, one drill to solve, and the reviews that are due. No decision fatigue.',
  },
  {
    icon: Hammer,
    title: 'No learning without an artifact',
    body: 'Every concept maps to drills and something you build — code, a benchmark, a design doc. Theory becomes proof.',
  },
  {
    icon: MapIcon,
    title: 'Roadmaps with real progress',
    body: 'Structured paths from a 9-day reset to a 12-month run at AI infrastructure depth. Progress is mastered concepts, not pages read.',
  },
];

const ROLE_PICKER = [
  {
    id: 'frontend',
    label: 'Frontend',
    icon: LayoutIcon,
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-500/15',
    tagline: 'React, perf, accessibility',
    sample: {
      kind: 'Coding · Medium',
      title: 'Throttled search with race-safe results',
      prompt: 'Build a typeahead that calls an API on each keystroke but always renders results from the latest query — even if responses arrive out of order.',
      tags: ['debounce', 'AbortController', 'state races'],
    },
  },
  {
    id: 'backend',
    label: 'Backend',
    icon: Server,
    accent: 'text-emerald-300',
    accentBg: 'bg-emerald-500/15',
    tagline: 'APIs, concurrency, storage',
    sample: {
      kind: 'Coding · Medium',
      title: 'Idempotent payment endpoint',
      prompt: 'Design and implement POST /charges so that a retried request with the same Idempotency-Key never double-charges, even under concurrent retries.',
      tags: ['idempotency', 'transactions', 'race conditions'],
    },
  },
  {
    id: 'system-design',
    label: 'System design',
    icon: Boxes,
    accent: 'text-purple-300',
    accentBg: 'bg-purple-500/15',
    tagline: 'Scale, tradeoffs, data flow',
    sample: {
      kind: 'HLD · 45 min',
      title: 'Design a URL shortener at 10k QPS',
      prompt: 'Sketch a system that issues short codes, redirects under 50ms p99, and survives a hot-key burst on a single short link.',
      tags: ['hashing', 'cache', 'sharding', 'hot keys'],
    },
  },
] as const;

const STEPS = [
  {
    n: '01',
    title: 'Pick a concept',
    body: 'Browse 8 tracks — search, vector databases, AI systems, backend, storage — or let the dashboard choose your next concept.',
  },
  {
    n: '02',
    title: 'Drill it, then build it',
    body: 'Solve focused drills, then ship the artifact in the Build Lab. A concept is not learned until an artifact exists.',
  },
  {
    n: '03',
    title: 'Review and compound',
    body: 'FSRS spaced repetition surfaces concepts right before you forget, and the progress page tracks whether learning is compounding.',
  },
];

export default function Login() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [activeRole, setActiveRole] = useState<typeof ROLE_PICKER[number]['id']>('backend');
  const activeRoleData = ROLE_PICKER.find((r) => r.id === activeRole) ?? ROLE_PICKER[1];

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setDebugInfo(clientId ? 'Client ID configured' : 'Missing VITE_GOOGLE_CLIENT_ID');
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[600px] max-w-5xl opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(59,130,246,0.35), rgba(168,85,247,0.15) 50%, transparent 80%)',
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">SWE Learning OS</span>
        </div>
        <button
          onClick={signInWithGoogle}
          className="rounded-md px-3 py-1.5 text-sm text-gray-200 transition-colors hover:text-white"
        >
          Sign in
        </button>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-16 pb-12 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/60 px-3 py-1 text-xs text-gray-200 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          Concept → Drill → Build → Review → Apply
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Land your next offer.
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Practice that pays off.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-gray-300">
          Realistic mock interviews with AI-powered feedback. Drills and structured roadmaps for backend, system design, and more.
        </p>

        <div className="relative mx-auto mt-8 max-w-xl">
          <div className="absolute -inset-x-2 -inset-y-4 z-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-30 blur-xl" />
          <div className="relative z-10 rounded-xl border border-gray-700 bg-gray-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Mock Interview Result</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">88</span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            <div className="mt-2 mb-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
            </div>
            <p className="mb-3 text-xs text-gray-400">Strong hire — answered trade-offs well, minor gaps</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-300">
                <CheckCircle className="h-3 w-3" />
                Correct algorithm
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-300">
                <CheckCircle className="h-3 w-3" />
                Trade-off analysis
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
                <XCircle className="h-3 w-3" />
                Concurrency bug
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={continueAsGuest}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_0_55px_-8px_rgba(168,85,247,0.8)] sm:w-auto"
          >
            Start a mock interview
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="text-xs text-gray-500">Free, no sign-up needed. Get an instant score.</p>
        </div>

        {import.meta.env.DEV && debugInfo && (
          <p className="mt-4 text-xs text-gray-600">{debugInfo}</p>
        )}
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-12 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 backdrop-blur transition-colors hover:border-gray-700"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1.5 text-sm text-gray-300">{body}</p>
          </div>
        ))}
      </section>

      {/* Mock interview proof */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
            <Code2 className="h-3 w-3" />
            Try it right now
          </span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            See a real question. Get real feedback.
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            This is exactly what a mock interview looks like — pick a topic, code your answer, get scored.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Sample question card */}
          <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                  Backend · Medium
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  30 min
                </span>
              </div>
              <span className="text-xs text-gray-600">Sample question</span>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-white">Design a Rate Limiter</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-300">
              Implement a token bucket rate limiter that allows <code className="rounded bg-gray-800 px-1 text-purple-300">N</code> requests per second. It must handle burst traffic correctly and be safe to call from multiple goroutines.
            </p>
            <div className="rounded-lg bg-gray-950 p-3 font-mono text-xs text-gray-400">
              <span className="text-blue-400">type</span>{' '}
              <span className="text-green-400">RateLimiter</span>{' '}
              <span className="text-gray-300">interface {'{'}</span>
              <br />
              {'  '}<span className="text-yellow-400">Allow</span>
              <span className="text-gray-300">() bool</span>
              <br />
              <span className="text-gray-300">{'}'}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['token bucket', 'concurrency', 'sliding window'].map((t) => (
                <span key={t} className="rounded-full border border-gray-700 px-2 py-0.5 text-xs text-gray-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Sample feedback card */}
          <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">AI feedback after your session</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">74</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
            </div>

            <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            </div>
            <p className="mb-4 text-xs text-gray-500">Score — good start, two gaps to close</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span className="text-gray-300">Correct algorithm — token bucket fits bursty traffic</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span className="text-gray-300">Clean interface, easy to swap implementations</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span className="text-gray-300">No handling for clock drift — causes silent throttle errors</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span className="text-gray-300">Missing test cases — interviewers notice this fast</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-xs text-gray-400">
              <span className="font-medium text-purple-300">Next to study:</span> monotonic clocks, sync.Mutex patterns
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={continueAsGuest}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_0_55px_-8px_rgba(168,85,247,0.8)] sm:w-auto"
          >
            Start a mock interview — no account needed
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="text-xs text-gray-500">30-minute session · immediate score · no sign-up required</p>
        </div>
      </section>

      {/* Role-specific practice picker proof */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="mb-6 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            <Target className="h-3 w-3" />
            Practice for your role
          </span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Pick a role. Get a question shaped for it.
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Drills, mock prompts, and feedback are tuned to what your interview loop actually asks.
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 backdrop-blur sm:p-5">
          <div role="tablist" aria-label="Practice role" className="mb-4 grid grid-cols-3 gap-2">
            {ROLE_PICKER.map((role) => {
              const isActive = role.id === activeRole;
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveRole(role.id)}
                  className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'border-gray-600 bg-gray-800/80'
                      : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${role.accentBg}`}>
                      <Icon className={`h-3.5 w-3.5 ${role.accent}`} />
                    </span>
                    <span className="text-sm font-semibold text-white">{role.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{role.tagline}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${activeRoleData.accentBg} ${activeRoleData.accent}`}>
                {activeRoleData.sample.kind}
              </span>
              <span className="text-xs text-gray-500">Example for {activeRoleData.label}</span>
            </div>
            <h3 className="text-sm font-semibold text-white">{activeRoleData.sample.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-300">{activeRoleData.sample.prompt}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeRoleData.sample.tags.map((t) => (
                <span key={t} className="rounded-full border border-gray-700 px-2 py-0.5 text-xs text-gray-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-gray-500">
            Switch roles to preview each track — your actual session pulls from 8 tracks of role-shaped drills.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-12">
        <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          How it works
        </h2>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 backdrop-blur"
            >
              <div className="font-mono text-xs tracking-[0.15em] text-blue-400/70">
                {s.n}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-gray-300">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 py-16">
        <h2 className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          What users say
        </h2>
        <SaaSMakerTestimonials />
      </section>

      <footer className="relative z-10 border-t border-gray-800 bg-gray-950/80 py-10 text-center">
        <p className="text-sm font-semibold text-white">
          Every offer starts with one practice session.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          DSA · System Design · LLD · Behavioral — all in one place, no tab-switching required.
        </p>
        <button
          onClick={continueAsGuest}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition-colors hover:border-purple-500/70 hover:bg-purple-500/20"
        >
          Start a mock interview — free, no sign-up
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="mt-6 text-xs text-gray-600">
          © {new Date().getFullYear()} Interview Coder · <a href="/privacy" className="underline hover:text-gray-400">Privacy</a>
        </p>
      </footer>
    </div>
  );
}
