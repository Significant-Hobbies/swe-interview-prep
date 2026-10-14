import { AlertCircle, LoaderCircle } from 'lucide-react';

export function ConceptMasteryReadState({
  error,
  refresh,
}: {
  error: string | null;
  refresh: () => Promise<void>;
}) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className="flex min-h-48 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-6 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        {error ? (
          <AlertCircle className="h-5 w-5 text-amber-300" aria-hidden="true" />
        ) : (
          <LoaderCircle className="h-5 w-5 animate-spin text-white/50" aria-hidden="true" />
        )}
        <p className="text-sm text-white/70">{error || 'Loading concept mastery…'}</p>
        {error && (
          <button
            type="button"
            className="min-h-11 rounded-md border border-white/15 px-4 text-xs font-medium text-white transition-colors hover:bg-white/5"
            onClick={() => void refresh()}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
