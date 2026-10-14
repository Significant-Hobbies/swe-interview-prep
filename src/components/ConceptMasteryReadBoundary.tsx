import type { ReactNode } from 'react';
import { ConceptMasteryReadState } from './ConceptMasteryReadState';

// Retain mounted controls and their geometry while an account read is unavailable.
export function ConceptMasteryReadBoundary({
  loading,
  error,
  refresh,
  children,
}: {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  children: ReactNode;
}) {
  const unavailable = loading || Boolean(error);
  return (
    <div className="relative" data-mastery-read-boundary>
      <div
        className={unavailable ? 'invisible' : undefined}
        aria-hidden={unavailable || undefined}
        inert={unavailable || undefined}
      >
        {children}
      </div>
      {unavailable && (
        <div className="absolute inset-0 flex items-center justify-center p-4 [&>div]:min-h-0 [&>div]:w-full [&>div]:max-w-md">
          <ConceptMasteryReadState error={error} refresh={refresh} />
        </div>
      )}
    </div>
  );
}
