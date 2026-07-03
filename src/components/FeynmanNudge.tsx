import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  signedIn: boolean;
  onExplain: () => void;
  onSkip: () => void;
}

/**
 * Post-solve nudge into the Feynman Gate — a 30-second, skippable
 * "explain this in plain English" ask that closes the drill → mastery loop.
 * Guests get a sign-in nudge instead (grading + FSRS mastery need an account).
 */
export default function FeynmanNudge({ signedIn, onExplain, onSkip }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2.5">
      <Brain className="h-4 w-4 shrink-0 text-sky-400" />
      <p className="min-w-0 flex-1 text-xs leading-relaxed text-slate-300">
        {signedIn
          ? 'Solved — now lock it in. Explain this in plain English (30 seconds).'
          : 'Solved — sign in to explain it back, get graded, and track concept mastery.'}
      </p>
      {signedIn ? (
        <button
          onClick={onExplain}
          className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-400"
        >
          Explain it
        </button>
      ) : (
        <Link
          to="/login"
          className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-400"
        >
          Sign in
        </Link>
      )}
      <button onClick={onSkip} className="text-xs text-slate-500 hover:text-slate-300">
        Skip
      </button>
    </div>
  );
}
