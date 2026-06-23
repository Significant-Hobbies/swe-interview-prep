import { Link, useParams } from 'react-router-dom';

import { RoadmapGraph } from '../components/RoadmapGraph';
import { ROADMAP_BY_ID } from '../data/learning-os';

/** Public share page — roadmap.sh-style preview without sign-in. */
export default function PublicRoadmap() {
  const { id } = useParams();
  const roadmap = id ? ROADMAP_BY_ID[id] : undefined;

  if (!roadmap) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-white/50">Roadmap not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-white">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/[0.08] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-bold">SWE Prep</span>
          <Link to="/" className="text-sm text-white/60 hover:text-white">
            Sign in to track progress
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Learning path
        </p>
        <h1 className="mt-2 text-3xl font-bold">{roadmap.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/60">{roadmap.description}</p>
        <p className="mt-2 text-xs text-white/40">Goal: {roadmap.goal}</p>

        <div className="mt-10">
          <RoadmapGraph roadmap={roadmap} mastery={{}} />
        </div>

        <p className="mt-8 text-sm text-white/50">
          Sign in to unlock drills, Playground artifacts, FSRS reviews, and proof-based gates.
        </p>
      </main>
    </div>
  );
}
