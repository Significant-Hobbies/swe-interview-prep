import '@excalidraw/excalidraw/index.css';

import { Loader2 } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

const Excalidraw = lazy(() =>
  import('@excalidraw/excalidraw').then((mod) => ({ default: mod.Excalidraw }))
);

const STORAGE_PREFIX = 'diagram-';

export interface DiagramDocument {
  elements: readonly any[];
  appState?: {
    zoom?: unknown;
    scrollX?: number;
    scrollY?: number;
  };
}

function loadDiagram(problemId: string): DiagramDocument | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + problemId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function serializeDiagram(elements: readonly any[], appState: any): DiagramDocument {
  return {
    elements,
    appState: { zoom: appState.zoom, scrollX: appState.scrollX, scrollY: appState.scrollY },
  };
}

function saveDiagram(problemId: string, document: DiagramDocument) {
  localStorage.setItem(STORAGE_PREFIX + problemId, JSON.stringify(document));
}

export default function DiagramEditor({
  problemId,
  onElementsChange,
  onDocumentChange,
  initialDocument,
  persist = true,
  readOnly = false,
}: {
  problemId: string;
  onElementsChange?: (elements: any[]) => void;
  onDocumentChange?: (document: DiagramDocument) => void;
  initialDocument?: DiagramDocument | null;
  persist?: boolean;
  readOnly?: boolean;
}) {
  const [initialData, setInitialData] = useState<any>(undefined);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const saved = initialDocument ?? (persist ? loadDiagram(problemId) : null);
    setInitialData(saved || { elements: [], appState: {} });
  }, [initialDocument, persist, problemId]);

  const handleChange = useCallback(
    (elements: readonly any[], appState: any) => {
      if (readOnly) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const document = serializeDiagram(elements, appState);
        if (persist) saveDiagram(problemId, document);
        onElementsChange?.([...elements]);
        onDocumentChange?.(document);
      }, 500);
    },
    [onDocumentChange, onElementsChange, persist, problemId, readOnly]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!initialData) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-slate-950">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            <span className="ml-2 text-sm text-slate-500">Loading diagram editor...</span>
          </div>
        }
      >
        <Excalidraw
          initialData={initialData}
          onChange={handleChange}
          theme="dark"
          viewModeEnabled={readOnly}
        />
      </Suspense>
    </div>
  );
}
