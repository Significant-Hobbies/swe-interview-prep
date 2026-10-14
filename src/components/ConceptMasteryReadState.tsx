export function ConceptMasteryReadState({
  error,
  refresh,
}: {
  error: string | null;
  refresh: () => Promise<void>;
}) {
  return (
    <div role={error ? 'alert' : 'status'} className="min-h-48 text-sm text-white/60">
      {error || 'Loading concept mastery…'}
      {error && (
        <button type="button" className="ml-3 underline" onClick={() => void refresh()}>
          Try again
        </button>
      )}
    </div>
  );
}
