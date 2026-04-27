import { ArrowRight,Brain, Code2, GitBranch, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SaaSMakerTestimonials } from '../components/saasmaker-feedback';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Daily plan, no decision fatigue',
    body: 'Open the app and the next concept is waiting — chosen for what you actually need to review.',
  },
  {
    icon: GitBranch,
    title: 'Patterns, not problems',
    body: 'Curated concepts grouped by the patterns that show up across companies. Drill the structure, not random questions.',
  },
  {
    icon: Brain,
    title: 'An AI tutor that grills you',
    body: 'Explain it back Feynman-style. Code it. Diagram it. The tutor asks the follow-up a real interviewer would.',
  },
];

export default function Login() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <Code2 className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">DSA Prep Studio</span>
        </div>
        <button
          onClick={signInWithGoogle}
          className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-white"
        >
          Sign in
        </button>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-16 pb-12 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/60 px-3 py-1 text-xs text-gray-300 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          AI picks your next concept. Every day.
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Stop grinding problems.
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
            Start drilling patterns.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-gray-400">
          A daily plan tells you exactly what to work on. Build, draw, and explain in one
          screen — and your AI tutor asks the questions a real interviewer would.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={signInWithGoogle}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-950 shadow-[0_0_30px_-10px_rgba(255,255,255,0.6)] transition-transform hover:scale-[1.02] sm:w-auto"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Start free with Google
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={continueAsGuest}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-800 bg-gray-900/60 px-5 py-3 text-sm font-medium text-gray-200 backdrop-blur transition-colors hover:bg-gray-800 sm:w-auto"
          >
            Try as guest
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-500">No credit card. Set up in under a minute.</p>

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
            <p className="mt-1.5 text-sm text-gray-400">{body}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 py-16">
        <h2 className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
          What users say
        </h2>
        <SaaSMakerTestimonials />
      </section>
    </div>
  );
}
